// sensorMeasurementController.js
const express = require('express');
const router = express.Router();

// 서비스 연결
const sensorMeasurementService = require('../services/sensorMeasurementService');
const currentBatchComponent = require('../components/currentBatchComponent');

// POST /sensor/measurement
router.post('/measurement', async (req, res) => {
    try {
        const dto = req.body;
        // 측정 데이터 저장
        await sensorMeasurementService.saveMeasurement(dto);
        res.status(200).send("Measurement saved successfully.");
    } catch (error) {
        console.error(error); // 에러 로그 출력
        res.status(400).send(error.message || "An error occurred while saving the measurement.");
    }
});

// GET /sensor
router.get('/', async (req, res) => {
    try {
        const batchId = req.query.batchId || await currentBatchComponent.getCurrentBatchId();
        const results = await sensorMeasurementService.getMeasurementsByBatchId(batchId);
        res.status(200).json(results);
    } catch (error) {
        console.error(error); // 에러 로그 출력
        res.status(500).json(null);
    }
});

// GET /sensor/date-range
router.get('/date-range', async (req, res) => {
    try {
        const { start, end, batchId } = req.query;
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        const results = await sensorMeasurementService.getMeasurementsByDateRange(
            startDate, endDate, batchId || await currentBatchComponent.getCurrentBatchId()
        );
        res.status(200).json(results);
    } catch (error) {
        console.error(error); // 에러 로그 출력
        res.status(500).json(null);
    }
});

module.exports = router;
