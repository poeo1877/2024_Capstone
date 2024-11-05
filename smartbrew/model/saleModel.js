// saleModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize instance
const SalesDetail = require('./salesDetailModel'); // Assuming this is in the same folder

const Sale = sequelize.define('Sale', {
  saleId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
  quantitySold: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  channel: {
    type: DataTypes.STRING(50),
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
  },
}, {
  tableName: 'sale',
  timestamps: false,
});

Sale.hasMany(SalesDetail, { foreignKey: 'saleId' });
SalesDetail.belongsTo(Sale, { foreignKey: 'saleId' });

module.exports = Sale;
