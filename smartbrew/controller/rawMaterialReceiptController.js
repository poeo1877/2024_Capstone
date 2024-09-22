// rawMaterialReceiptController.js
const express = require('express');
const router = express.Router();
const rawMaterialReceiptService = require('../services/rawMaterialReceiptService');

// GET all Raw Material Receipts as DTOs
router.get('/', async (req, res) => {
  try {
    const dtos = await rawMaterialReceiptService.getAllRawMaterialDTOs();
    res.status(200).json(dtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new Raw Material Receipt
router.post('/', async (req, res) => {
  try {
    const dto = await rawMaterialReceiptService.saveReceipt(req.body);
    res.status(201).json(dto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
