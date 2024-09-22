// rawMaterialController.js
const express = require('express');
const router = express.Router();
const rawMaterialService = require('../services/rawMaterialService');

router.get('/', async (req, res) => {
  try {
    const rawMaterials = await rawMaterialService.findAllRawMaterials();
    const dtos = rawMaterials.map(rawMaterialService.convertToDTO);
    res.status(200).json(dtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rawMaterial = await rawMaterialService.findRawMaterialById(req.params.id);
    if (!rawMaterial) return res.status(404).json({ error: 'Raw material not found' });

    const dto = rawMaterialService.convertToDTO(rawMaterial);
    res.status(200).json(dto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newRawMaterial = await rawMaterialService.saveRawMaterial(req.body);
    const dto = rawMaterialService.convertToDTO(newRawMaterial);
    res.status(201).json(dto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
