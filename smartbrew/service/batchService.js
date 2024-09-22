// batchService.js
const Batch = require('../models/batchModel');

const getAllBatches = async () => {
  return await Batch.findAll();
};

const getBatchById = async (id) => {
  const batch = await Batch.findByPk(id);
  if (!batch) throw new Error(`Batch with ID ${id} not found`);
  return batch;
};

const createBatch = async (batchDTO) => {
  const newBatch = await Batch.create(batchDTO);
  return newBatch;
};

const updateBatch = async (id, batchDTO) => {
  const batch = await Batch.findByPk(id);
  if (!batch) throw new Error(`Batch with ID ${id} not found`);

  await batch.update(batchDTO);
  return batch;
};

const deleteBatch = async (id) => {
  const batch = await Batch.findByPk(id);
  if (!batch) throw new Error(`Batch with ID ${id} not found`);

  await batch.destroy();
};

module.exports = {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
};
