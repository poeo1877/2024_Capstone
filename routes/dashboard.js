var express = require('express');
var router = express.Router();

const { Client } = require('pg');

const dbClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

dbClient.connect();

router.get('/recent', async function (req, res, next) {
    try {
        const latestResult = await dbClient.query(
            'SELECT * FROM public.sensor_measurement ORDER BY measured_time DESC LIMIT 1;',
        );

        const previousResult = await dbClient.query(
            'SELECT * FROM public.sensor_measurement ORDER BY measured_time DESC LIMIT 2 OFFSET 1;',
        );

        if (latestResult.rows.length > 0) {
            const latestData = latestResult.rows[0];
            const previousData =
                previousResult.rows.length > 0 ? previousResult.rows[0] : null;

            const temperatureDiff = previousData
                ? latestData.in_temperature - previousData.in_temperature
                : null;

            const co2Diff = previousData
                ? latestData.co2_concentration - previousData.co2_concentration
                : null;

            const pressureDiff = previousData
                ? latestData.pressure_upper - previousData.pressure_upper
                : null;

            res.json({
                temperature: latestData.in_temperature,
                co2: latestData.co2_concentration,
                pressure: latestData.pressure_upper,
                temperatureDiff,
                co2Diff,
                pressureDiff,
                previousTemperature: previousData
                    ? previousData.in_temperature
                    : null,
                previousCO2: previousData
                    ? previousData.co2_concentration
                    : null,
                previousPressure: previousData
                    ? previousData.pressure_upper
                    : null,
            });
        } else {
            res.json({ temperature: 'No data' });
        }
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Database query error');
    }
});

router.get('/chart-data', (req, res) => {
    const query =
        'SELECT in_temperature, co2_concentration, pressure_upper, measured_time, batch_id FROM public.sensor_measurement WHERE batch_id = 5;';
    dbClient.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

module.exports = router;
