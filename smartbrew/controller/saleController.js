// saleController.js
const express = require('express');
const router = express.Router();
const saleService = require('../services/saleService');

// GET sales report
router.get('/report', async (req, res) => {
  try {
    const salesReport = await saleService.getSalesReport();
    res.status(200).json(salesReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
