// rawMaterialService.js
const RawMaterial = require('../models/rawMaterialModel');

const saveRawMaterial = async (rawMaterial) => {
  return await RawMaterial.create(rawMaterial);
};

const findAllRawMaterials = async () => {
  return await RawMaterial.findAll();
};

const findRawMaterialById = async (id) => {
  return await RawMaterial.findByPk(id);
};

const convertToDTO = (rawMaterial) => {
  return {
    rawMaterialId: rawMaterial.rawMaterialId,
    date: rawMaterial.createdAt,
    rawMaterialName: rawMaterial.rawMaterialName,
    rawMaterialDescription: rawMaterial.description,
    supplierName: rawMaterial.supplierName,
    rawMaterialUnit: rawMaterial.unit,
    rawMaterialStock: rawMaterial.todayStock || 0,
    rawMaterialUse: rawMaterial.rawMaterialUse,
    todayStock: rawMaterial.todayStock,
  };
};

module.exports = {
  saveRawMaterial,
  findAllRawMaterials,
  findRawMaterialById,
  convertToDTO,
};
