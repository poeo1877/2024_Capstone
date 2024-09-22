// rawMaterialReceiptModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize instance
const RawMaterial = require('./rawMaterialModel'); // Assuming you have rawMaterialModel.js

const RawMaterialReceipt = sequelize.define('RawMaterialReceipt', {
  receiptId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rawMaterialId: {
    type: DataTypes.BIGINT,
    references: {
      model: RawMaterial,
      key: 'rawMaterialId',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'raw_material_receipt',
  timestamps: false,
});

RawMaterialReceipt.belongsTo(RawMaterial, { foreignKey: 'rawMaterialId' });

module.exports = RawMaterialReceipt;
