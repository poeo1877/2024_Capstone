// sensorMeasurementModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sequelize 인스턴스

const SensorMeasurement = sequelize.define('SensorMeasurement', {
  dataId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  co2Concentration: {
    type: DataTypes.INTEGER,
  },
  brix: {
    type: DataTypes.DECIMAL,
  },
  measuredTime: {
    type: DataTypes.DATE,
  },
  outTemperature: {
    type: DataTypes.DECIMAL,
  },
  inTemperature: {
    type: DataTypes.DECIMAL,
  },
  ph: {
    type: DataTypes.DECIMAL,
  },
  pressureUpper: {
    type: DataTypes.DECIMAL,
  },
  pressureLower: {
    type: DataTypes.DECIMAL,
  },
  batchId: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
}, {
  tableName: 'sensor_measurement',
  timestamps: false,
});

module.exports = SensorMeasurement;
