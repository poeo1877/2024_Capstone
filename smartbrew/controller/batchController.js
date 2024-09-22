// batchController.js
const express = require('express');
const router = express.Router();
const batchService = require('../services/batchService');

router.get('/', async (req, res) => {
  try {
    const batches = await batchService.getAllBatches();
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const batch = await batchService.getBatchById(req.params.id);
    res.status(200).json(batch);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newBatch = await batchService.createBatch(req.body);
    res.status(201).json(newBatch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedBatch = await batchService.updateBatch(req.params.id, req.body);
    res.status(200).json(updatedBatch);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await batchService.deleteBatch(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
