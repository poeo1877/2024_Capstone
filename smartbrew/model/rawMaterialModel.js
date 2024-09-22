// rawMaterialModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 인스턴스

const RawMaterial = sequelize.define('RawMaterial', {
  rawMaterialId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  rawMaterialName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  supplierName: {
    type: DataTypes.STRING,
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  zipCode: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  rawMaterialUse: {
    type: DataTypes.DECIMAL,
  },
  todayStock: {
    type: DataTypes.DECIMAL,
  },
}, {
  tableName: 'raw_material',
  timestamps: false,
});

module.exports = RawMaterial;
