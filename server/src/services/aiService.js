const config = require('../config/env');

/**
 * System prompt following project specification
 */
const SYSTEM_PROMPT = `You are an AI meeting assistant.
Analyze the provided meeting transcript and return structured information.

Extract:
1. A concise meeting summary.
2. Important discussion points.
3. Decisions made.
4. Action items.
5. Task owner if identifiable.
6. Deadline if mentioned.
7. Priority (High, Medium, or Low).
8. Unresolved issues and follow-ups.

Do not invent information.
If an owner or deadline is not mentioned, return null for that field.

Return ONLY valid JSON matching this schema:
{
  "summary": "Concise paragraph overview of the meeting",
  "keyPoints": [
    "Important discussion point 1",
    "Important discussion point 2"
  ],
  "decisions": [
    "Decision 1 made during meeting",
    "Decision 2 made during meeting"
  ],
  "actionItems": [
    {
      "task": "Specific task description",
      "owner": "Person name or null",
      "deadline": "Deadline text/date or null",
      "priority": "High | Medium | Low",
      "status": "Pending"
    }
  ],
  "followUps": [
    "Unresolved issue or item requiring future discussion"
  ]
}`;

/**
 * Clean and parse JSON response from LLM, handling possible markdown blocks
 */
const parseCleanJson = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty AI response received');
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if model returned them
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  // Attempt direct JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // If there is extra preamble or trailing text, find first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const slice = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(slice);
    }
    throw new Error(`Failed to parse AI response as JSON: ${err.message}`);
  }
};

/**
 * Normalize and validate the structured response according to project models
 */
const normalizeAiOutput = (data) => {
  const summary = typeof data.summary === 'string' ? data.summary.trim() : '';

  const keyPoints = Array.isArray(data.keyPoints)
    ? data.keyPoints.map((k) => String(k).trim()).filter(Boolean)
    : [];

  const decisions = Array.isArray(data.decisions)
    ? data.decisions.map((d) => String(d).trim()).filter(Boolean)
    : [];

  const followUps = Array.isArray(data.followUps)
    ? data.followUps.map((f) => String(f).trim()).filter(Boolean)
    : [];

  const actionItems = Array.isArray(data.actionItems)
    ? data.actionItems.map((item) => {
        let priority = 'Medium';
        if (typeof item.priority === 'string') {
          const p = item.priority.toLowerCase();
          if (p.includes('high')) priority = 'High';
          else if (p.includes('low')) priority = 'Low';
          else priority = 'Medium';
        }

        return {
          task: item.task ? String(item.task).trim() : 'Unnamed task',
          owner: item.owner && String(item.owner).trim() !== '' && String(item.owner).toLowerCase() !== 'null'
            ? String(item.owner).trim()
            : null,
          deadline: item.deadline && String(item.deadline).trim() !== '' && String(item.deadline).toLowerCase() !== 'null'
            ? String(item.deadline).trim()
            : null,
          priority,
          status: item.status && ['Pending', 'In Progress', 'Completed'].includes(item.status)
            ? item.status
            : 'Pending'
        };
      })
    : [];

  return {
    summary: summary || 'No summary could be generated from the transcript.',
    keyPoints,
    decisions,
    actionItems,
    followUps
  };
};

/**
 * Call Google Gemini API
 */
const callGeminiApi = async (transcript, apiKey) => {
  const keyToUse = apiKey || config.AI_API_KEY;

  if (!keyToUse) {
    throw new Error(
      'AI API Key is missing. Please set AI_API_KEY in server/.env or configure your key in Settings.'
    );
  }

  // Support models in order of current Google API availability & speed
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite'
  ];
  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToUse}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${SYSTEM_PROMPT}\n\nHere is the meeting transcript to analyze:\n\n${transcript}`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout per model

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const jsonResult = await response.json();

      if (!response.ok) {
        const errorMsg = jsonResult?.error?.message || `HTTP ${response.status} from Gemini API`;
        // If API key is explicitly invalid, don't waste time trying other models
        if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid')) {
          throw new Error(`Gemini API Key Error: ${errorMsg}`);
        }
        // If model not found, deprecated, high demand, or rate limited, try next model
        if (
          response.status === 404 ||
          response.status === 400 ||
          response.status === 429 ||
          response.status === 503 ||
          errorMsg.includes('not found') ||
          errorMsg.includes('no longer available') ||
          errorMsg.includes('deprecated') ||
          errorMsg.includes('not supported') ||
          errorMsg.includes('high demand') ||
          errorMsg.includes('Resource has been exhausted')
        ) {
          lastError = new Error(errorMsg);
          continue;
        }
        throw new Error(errorMsg);
      }

      const candidate = jsonResult?.candidates?.[0];
      const textOutput = candidate?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error('Gemini API returned an empty output');
      }

      const parsed = parseCleanJson(textOutput);
      return normalizeAiOutput(parsed);
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.message && (err.message.includes('API Key Error') || err.message.includes('API_KEY_INVALID'))) {
        throw err;
      }
    }
  }

  const finalMsg = lastError?.message || 'Failed to generate analysis using Gemini API.';
  if (finalMsg.includes('high demand') || finalMsg.includes('503') || finalMsg.includes('Resource has been exhausted')) {
    throw new Error('Google Gemini AI is currently experiencing high demand. Please try submitting again in a moment.');
  }
  throw new Error(finalMsg);
};

/**
 * Service function: analyze transcript with AI
 */
const analyzeTranscript = async (transcript, userApiKey = null) => {
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    throw new Error('Transcript is required for AI processing');
  }

  return await callGeminiApi(transcript.trim(), userApiKey);
};

/**
 * Service function: test API key validity
 */
const testApiKey = async (apiKey) => {
  const models = [
    'gemini-3.1-flash-lite',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.8-flash'
  ];
  let lastError = null;

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, reply with {"status":"ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await response.json();
      if (response.ok) {
        return { success: true, message: `Gemini API key is valid! (Connected with ${model})` };
      }

      const msg = json?.error?.message || 'Invalid API key or network error';
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        throw new Error(msg);
      }
      lastError = new Error(msg);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to validate Gemini API key.');
};

module.exports = {
  analyzeTranscript,
  testApiKey,
  normalizeAiOutput
};
