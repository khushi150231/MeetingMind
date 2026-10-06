const express = require('express');
const router = express.Router();
const { analyzeRawTranscript, testKeyEndpoint } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/analyze-raw', analyzeRawTranscript);
router.post('/test-key', testKeyEndpoint);

module.exports = router;
