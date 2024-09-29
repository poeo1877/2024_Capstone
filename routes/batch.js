var express = require('express');
var router = express.Router();
const { Batch, Recipe, Fermenter } = require('../models');
const moment = require('moment-timezone');

const { Client } = require('pg');

const dbClient = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

dbClient.connect();

router.get('/list', async (req, res) => {
    try {
        // Batch와 Recipe를 조인하여 데이터 가져오기
        const batches = await Batch.findAll({
            include: {
                model: Recipe,
                attributes: ['recipe_name'], // 필요한 recipe_name만 가져오기
            },
        });

        // EJS 템플릿에 데이터를 전달하여 렌더링
        res.render('batch/list', { batches });
    } catch (error) {
        console.error('Error fetching batch list:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/create', async (req, res) => {
    try {
        // Batch와 Recipe를 조인하여 데이터 가져오기
        const recipes = await Recipe.findAll({});
        const fermenters = await Fermenter.findAll({});
        // EJS 템플릿에 데이터를 전달하여 렌더링
        res.render('batch/create', { recipes, fermenters });
    } catch (error) {
        console.error('Error fetching batch list:', error);
        res.status(500).send('Internal Server Error');
    }
});
// 배치 생성 POST 요청
router.post('/create', async (req, res) => {
    const { recipe_id, fermenter_id } = req.body;

    if (!recipe_id || !fermenter_id) {
        return res.status(400).json({ error: '레시피와 발효조를 선택하세요.' });
    }

    try {
        const newBatch = await Batch.create({
            start_time: new Date(), // 현재 시간
            end_time: null, // 초기값으로 null 설정
            recipe_ratio: '', // 초기값으로 공백 설정
            recipe_id: recipe_id,
            fermenter_id: fermenter_id,
        });

        res.status(201).json({ success: true, batch: newBatch });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/:id', (req, res) => {
    const batchId = req.params.id;
    // 데이터베이스에서 배치 정보 조회
    // ...
    res.render('batch/dashboard', { batchId }); // 'batchDetail'은 뷰 파일 이름
});

router.get('/archive', async (req, res) => {
    try {
        const result = await dbClient.query(
            'SELECT * FROM sensor_measurement WHERE batch_id = 5 ORDER BY data_id ASC',
        );
        const data = result.rows;
        // 날짜 형식 변환
        const timestamps = data.map((row) => {
            return moment(row.measured_time)
                .tz('Asia/Seoul')
                .format('YYYY-MM-DD HH:mm');
        });
        const dataId = data.map((row) => row.data_id);
        const temperatureData = data.map((row) => row.in_temperature);
        const co2Data = data.map((row) => row.co2_concentration);
        const pressureData = data.map((row) => row.pressure_upper);

        res.render('batch-archive.ejs', {
            title: 'archive',
            timestamps: JSON.stringify(timestamps),
            dataId: JSON.stringify(dataId),
            temperatureData: JSON.stringify(temperatureData),
            co2Data: JSON.stringify(co2Data),
            pressureData: JSON.stringify(pressureData),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
