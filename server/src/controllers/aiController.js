const Meeting = require('../models/Meeting');
const User = require('../models/User');
const { analyzeTranscript, testApiKey } = require('../services/aiService');

// Helper to get active API key for current user (user key overrides server key)
const getUserApiKey = (user) => {
  return user?.customApiKey || null;
};

// @desc    Analyze meeting by ID
// @route   POST /api/meetings/:id/analyze
// @access  Private
const analyzeMeetingById = async (req, res, next) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    // Ownership check
    if (meeting.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to analyze this meeting'
      });
    }

    const transcriptToAnalyze = req.body.transcript || meeting.transcript;

    if (!transcriptToAnalyze || !transcriptToAnalyze.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Meeting transcript is empty. Please provide a transcript to analyze.'
      });
    }

    // Mark as Processing
    meeting.status = 'Processing';
    await meeting.save();

    try {
      const apiKey = getUserApiKey(req.user);
      const aiResult = await analyzeTranscript(transcriptToAnalyze, apiKey);

      // Save structured results to meeting
      meeting.summary = aiResult.summary;
      meeting.keyPoints = aiResult.keyPoints;
      meeting.decisions = aiResult.decisions;
      meeting.actionItems = aiResult.actionItems;
      meeting.followUps = aiResult.followUps;
      meeting.status = 'Processed';

      const savedMeeting = await meeting.save();

      return res.json({
        success: true,
        message: 'Meeting analyzed successfully',
        analysis: aiResult,
        meeting: savedMeeting
      });
    } catch (aiErr) {
      // Mark as Failed if AI call failed
      meeting.status = 'Failed';
      await meeting.save();

      return res.status(502).json({
        success: false,
        message: `AI Analysis Failed: ${aiErr.message}`
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze raw transcript without prior meeting record (for interactive create/preview flow)
// @route   POST /api/ai/analyze-raw
// @access  Private
const analyzeRawTranscript = async (req, res, next) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a meeting transcript'
      });
    }

    const apiKey = getUserApiKey(req.user);
    const aiResult = await analyzeTranscript(transcript.trim(), apiKey);

    res.json({
      success: true,
      message: 'Transcript analyzed successfully',
      analysis: aiResult
    });
  } catch (error) {
    res.status(502).json({
      success: false,
      message: `AI Analysis Failed: ${error.message}`
    });
  }
};

// @desc    Test AI API key validity
// @route   POST /api/ai/test-key
// @access  Private
const testKeyEndpoint = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const keyToTest = apiKey || getUserApiKey(req.user);

    if (!keyToTest) {
      return res.status(400).json({
        success: false,
        message: 'No API key provided to test'
      });
    }

    const result = await testApiKey(keyToTest);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'API key test failed'
    });
  }
};

module.exports = {
  analyzeMeetingById,
  analyzeRawTranscript,
  testKeyEndpoint
};
