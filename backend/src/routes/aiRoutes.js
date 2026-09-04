const express = require('express');
const { analyzeText, analyzeImage, explainPriority, hotspots, insights } = require('../controllers/aiController');

const router = express.Router();

router.post('/analyze-text', analyzeText);
router.post('/analyze-image', analyzeImage);
router.get('/priority-explain/:caseId', explainPriority);
router.get('/hotspots', hotspots);
router.get('/insights', insights);

module.exports = router;
