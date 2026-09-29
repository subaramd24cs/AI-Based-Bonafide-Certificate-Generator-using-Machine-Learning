const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/predict', async (req, res) => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.post(`${mlServiceUrl}/predict`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('ML Service error:', error.message);
    res.json({
      prediction: 'eligible',
      confidence: 0.75,
      message: 'ML service unavailable, using default prediction'
    });
  }
});

module.exports = router;