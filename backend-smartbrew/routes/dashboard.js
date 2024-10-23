var express = require('express');
var router = express.Router();

const db = require('../models');
const DashboardLimit = db.DashboardLimit;

const moment = require('moment-timezone');
// router.get('/recent', function (req, res, next) {
//     dbClient.query(
//         'SELECT * FROM public.sensor_measurement ORDER BY measured_time DESC LIMIT 1;',
//         (err, result) => {
//             if (err) {
//                 console.error('Error executing query', err.stack);
//                 res.status(500).send('Database query error');
//             } else {
//                 if (result.rows.length > 0) {
//                     res.json({
//                         temperature: result.rows[0].in_temperature,
//                         co2: result.rows[0].co2_concentration,
//                         pressure: result.rows[0].pressure_upper,
//                     });
//                 } else {
//                     res.json({ temperature: 'No data' });
//                 }
//             }
//         },
//     );
// });

router.get('/chart-data', (req, res) => {
    const query =
        'SELECT in_temperature, co2_concentration, pressure_upper, measured_time, batch_id FROM public.sensor_measurement WHERE batch_id = 5;';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

router.post('/limit', async (req, res) => {
    try {
        const { daterange, batchId } = req.body;
        const val_sensor = req.body['val-sensor']; // Accessing using bracket notation
        const val_upper_limit = req.body['val-upper-limit'];
        const val_lower_limit = req.body['val-lower-limit'];

        // Check if all required fields are provided
        if (
            !daterange ||
            !val_sensor ||
            !val_upper_limit ||
            !val_lower_limit ||
            !batchId
        ) {
            return res.status(400).send('All fields are required.');
        }
        // Split the daterange into start and end dates
        const [startDateStr, endDateStr] = daterange
            .split(' - ')
            .map((date) => date.trim());
        const start_date = moment.tz(startDateStr, 'Asia/Seoul');
        const end_date = moment.tz(endDateStr, 'Asia/Seoul');
        const batchIds = JSON.parse(batchId);

        const batchNum = batchIds[0];
        // Validate numerical limits
        if (parseFloat(val_upper_limit) <= parseFloat(val_lower_limit)) {
            return res
                .status(400)
                .send('Upper limit must be greater than lower limit.');
        }
        // await DashboardLimit.destroy({
        //     where: {
        //         limit_id: limitId, // 중복 체크할 필드
        //     },
        // });
        // Create a new DashboardLimit entry
        const dashboardLimit = await DashboardLimit.create({
            batch_id: batchNum, // Ensure batchId is an integer
            sensor_type: val_sensor,
            startdate: start_date.format('YYYY-MM-DD HH:mm:ss'),
            enddate: end_date.format('YYYY-MM-DD HH:mm:ss'),
            upper_limit: parseFloat(val_upper_limit),
            lower_limit: parseFloat(val_lower_limit),
        });
        res.redirect('/dashboard');
        // Respond with the created entry or a success message
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving the notification settings');
    }
});

router.get('/all-limit', async (req, res) => {
    const { batchId } = req.query;

    if (!batchId) {
        return res.status(400).json({ error: 'batchId is required' });
    }

    try {
        // batchId에 해당하는 모든 dashboard_limit 데이터 조회
        const limits = await DashboardLimit.findAll({
            where: {
                batch_id: batchId,
            },
        });

        // 결과가 없다면 404 에러 응답
        if (limits.length === 0) {
            return res
                .status(404)
                .json({ message: 'No limits found for this batchId' });
        }

        // 데이터 응답
        return res.status(200).json(limits);
    } catch (error) {
        console.error('Error fetching limits:', error);
        return res
            .status(500)
            .json({ error: 'An error occurred while fetching limits' });
    }
});

module.exports = router;
