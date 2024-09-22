// fermenterService.js
const Fermenter = require('../models/fermenterModel');

const getAllFermenters = async () => {
  return await Fermenter.findAll();
};

const getFermenterById = async (id) => {
  const fermenter = await Fermenter.findByPk(id);
  if (!fermenter) throw new Error(`Fermenter with ID ${id} not found`);
  return fermenter;
};

const createFermenter = async (dto) => {
  const newFermenter = await Fermenter.create(dto);
  return newFermenter;
};

const updateFermenter = async (id, dto) => {
  const fermenter = await Fermenter.findByPk(id);
  if (!fermenter) throw new Error(`Fermenter with ID ${id} not found`);

  await fermenter.update(dto);
  return fermenter;
};

const deleteFermenter = async (id) => {
  const fermenter = await Fermenter.findByPk(id);
  if (!fermenter) throw new Error(`Fermenter with ID ${id} not found`);

  await fermenter.destroy();
};

module.exports = {
  getAllFermenters,
  getFermenterById,
  createFermenter,
  updateFermenter,
  deleteFermenter,
};
