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

router.get('/recent', function (req, res, next) {
    dbClient.query(
        'SELECT * FROM public.sensor_measurement ORDER BY measured_time DESC LIMIT 1;',
        (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
                res.status(500).send('Database query error');
            } else {
                if (result.rows.length > 0) {
                    res.json({
                        temperature: result.rows[0].in_temperature,
                        co2: result.rows[0].co2_concentration,
                        pressure: result.rows[0].pressure_upper,
                    });
                } else {
                    res.json({ temperature: 'No data' });
                }
            }
        },
    );
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
