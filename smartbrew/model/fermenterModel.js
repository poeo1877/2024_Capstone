// fermenterModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize instance

const Fermenter = sequelize.define('Fermenter', {
  fermenterId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  fermenterVolume: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('WAITING', 'FERMENTING', 'COMPLETED'), // Assuming these are possible statuses
    allowNull: false,
  },
  fermenterLine: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'fermenter',
  timestamps: false,
});

module.exports = Fermenter;
