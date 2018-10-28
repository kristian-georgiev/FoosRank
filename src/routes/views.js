// dependencies
const express = require('express');
const router = express.Router();

// public endpoints
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'src/views' });
});

router.get('/test', function(req, res) {
  res.sendFile('test.html', { root: 'src/views' });
});

module.exports = router;