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

router.get('/temperature', function (req, res, next) {
    dbClient.query(
        'SELECT in_temperature FROM sensor_measurement LIMIT 1',
        (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
                res.status(500).send('Database query error');
            } else {
                if (result.rows.length > 0) {
                    res.json({ temperature: result.rows[0].in_temperature });
                } else {
                    res.json({ temperature: 'No data' });
                }
            }
        },
    );
});

module.exports = router;
