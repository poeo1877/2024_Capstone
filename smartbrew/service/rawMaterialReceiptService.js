// rawMaterialReceiptService.js
const RawMaterialReceipt = require('../models/rawMaterialReceiptModel');
const RawMaterial = require('../models/rawMaterialModel');

const getAllRawMaterialDTOs = async () => {
  const rawMaterialData = await RawMaterialReceipt.findAll({
    include: [{ model: RawMaterial }],
    order: [['receiptId', 'ASC']],
  });

  const cumulativeTodayStockMap = new Map();

  return rawMaterialData.map((receipt) => {
    const dto = convertToDTO(receipt, receipt.RawMaterial, cumulativeTodayStockMap);
    const rawMaterialId = dto.rawMaterialId;
    const newStock = (cumulativeTodayStockMap.get(rawMaterialId) || 0) + parseFloat(dto.rawMaterialStock);
    cumulativeTodayStockMap.set(rawMaterialId, newStock);
    dto.todayStock = newStock;
    return dto;
  });
};

const saveReceipt = async (receiptDTO) => {
  const rawMaterial = await RawMaterial.findByPk(receiptDTO.rawMaterialId);
  if (!rawMaterial) {
    throw new Error('Raw material not found');
  }

  const receipt = await RawMaterialReceipt.create({
    quantity: receiptDTO.quantity,
    unitPrice: receiptDTO.unitPrice,
    rawMaterialId: receiptDTO.rawMaterialId,
  });

  return convertToDTO(receipt, rawMaterial, new Map());
};

const convertToDTO = (receipt, rawMaterial, cumulativeTodayStockMap) => {
  const rawMaterialId = rawMaterial.rawMaterialId;
  const cumulativeTodayStock = cumulativeTodayStockMap.get(rawMaterialId) || 0;
  const todayStock = cumulativeTodayStock + parseFloat(receipt.quantity);

  return {
    rawMaterialId: rawMaterialId,
    date: receipt.createdAt,
    rawMaterialName: rawMaterial.rawMaterialName,
    rawMaterialDescription: rawMaterial.description,
    supplierName: rawMaterial.supplierName,
    rawMaterialUnit: rawMaterial.unit,
    rawMaterialStock: parseFloat(receipt.quantity),
    rawMaterialUse: 0,
    todayStock: todayStock,
  };
};

module.exports = {
  getAllRawMaterialDTOs,
  saveReceipt,
};
