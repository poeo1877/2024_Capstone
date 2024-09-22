// sensorMeasurementService.js
const SensorMeasurement = require('../models/sensorMeasurementModel'); // Sequelize ¸ðµ¨
const currentBatchComponent = require('../components/currentBatchComponent');
const { Op } = require('sequelize');

// Save Measurement
const saveMeasurement = async (dto) => {
    const currentBatchId = await currentBatchComponent.getCurrentBatchId();

    if (!currentBatchId) {
        throw new Error("No batch is currently fermenting. Data cannot be stored.");
    }

    const measurement = {
        ...dto,
        batchId: currentBatchId,
        brix: calculateBrix(dto.pressureUpper, dto.pressureLower), // BRIX °è»ê
    };

    try {
        await SensorMeasurement.create(measurement);
    } catch (error) {
        console.error('Error saving measurement:', error);
        throw error;
    }
};

// Get Measurements by Date Range
const getMeasurementsByDateRange = async (start, end, batchId) => {
    try {
        const measurements = await SensorMeasurement.findAll({
            where: {
                measuredTime: {
                    [Op.between]: [start, end]
                },
                batchId: batchId
            },
            order: [['measuredTime', 'ASC']]
        });
        return measurements;
    } catch (error) {
        console.error('Error fetching measurements by date range:', error);
        throw error;
    }
};

// Get Measurements by Batch ID
const getMeasurementsByBatchId = async (batchId) => {
    try {
        const measurements = await SensorMeasurement.findAll({
            where: { batchId },
            order: [['measuredTime', 'ASC']]
        });
        return measurements;
    } catch (error) {
        console.error('Error fetching measurements by batchId:', error);
        throw error;
    }
};

// Utility function to calculate BRIX
const calculateBrix = (pressureUpper, pressureLower) => {
    if (!pressureUpper || !pressureLower) return null;
    return (pressureUpper - pressureLower).toFixed(2);
};

module.exports = {
    saveMeasurement,
    getMeasurementsByDateRange,
    getMeasurementsByBatchId,
};
