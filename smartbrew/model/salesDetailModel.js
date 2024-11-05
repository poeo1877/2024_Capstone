// salesDetailModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./productModel'); // Assuming there's a product model

const SalesDetail = sequelize.define('SalesDetail', {
  saleDetailId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discountYn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  productId: {
    type: DataTypes.BIGINT,
    references: {
      model: Product,
      key: 'productId',
    },
  },
  saleId: {
    type: DataTypes.BIGINT,
    references: {
      model: Sale,
      key: 'saleId',
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
  tableName: 'sales_detail',
  timestamps: false,
});

module.exports = SalesDetail;
