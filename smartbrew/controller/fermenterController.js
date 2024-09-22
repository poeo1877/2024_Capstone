// fermenterController.js
const express = require('express');
const router = express.Router();
const fermenterService = require('../services/fermenterService');

router.get('/', async (req, res) => {
  try {
    const fermenters = await fermenterService.getAllFermenters();
    res.status(200).json(fermenters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fermenter = await fermenterService.getFermenterById(req.params.id);
    res.status(200).json(fermenter);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newFermenter = await fermenterService.createFermenter(req.body);
    res.status(201).json(newFermenter);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedFermenter = await fermenterService.updateFermenter(req.params.id, req.body);
    res.status(200).json(updatedFermenter);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await fermenterService.deleteFermenter(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;
