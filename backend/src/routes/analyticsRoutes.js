const express = require('express');
const { overview, charts } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/overview', overview);
router.get('/charts', charts);

module.exports = router;
