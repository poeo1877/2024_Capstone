// batchModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 인스턴스 가져오기

const Batch = sequelize.define('Batch', {
  batchId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  endTime: {
    type: DataTypes.DATE,
  },
  recipeRatio: {
    type: DataTypes.STRING,
    defaultValue: "1.0",
  },
  recipeId: {
    type: DataTypes.BIGINT,
  },
  fermenterId: {
    type: DataTypes.BIGINT,
  },
}, {
  tableName: 'batch',
  timestamps: false,
});

module.exports = Batch;
