var express = require('express');
var router = express.Router();
const db = require('../models'); // /models/index.js를 import
const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);

const { SensorMeasurement, Alert } = require('../models');
const {
    getSensorDataByBatchIds,
    getLatestSensorDataByBatchId,
    createExcelFileForBatchIds,
    getFermentingBatchId,
    getSensorDataByBatchIdDashboard,
} = require('../services/db_services');

/**
 * @swagger
 * /api/sensor/measurement: # 경로
 *  post: # HTTP 메서드
 *  summary: 라즈베리파이로 측정한 센서 데이터를 DB에 저장  # 요약
 */
router.post('/sensor/measurement', async (req, res) => {
    try {
        /* 
            라즈베리파이에서 데이터 전송시 다음과 같은 형태로 보내줘야 한다.
            {
                "out_temperature": 14.79,
                "in_temperature": 23.49,
                "pressure_upper": 999999.59,
                "pressure_lower": 101325.00,
                "co2_concentration": 3988,
                "ph": 4.01,
                "measured_time": "2024-06-22T02:58:00"
            }
        */
        let {
            co2_concentration,
            brix,
            measured_time,
            out_temperature,
            in_temperature,
            ph,
            pressure_upper,
            pressure_lower,
        } = req.body;

        // measured_time이 null인 경우 예외 처리
        if (!measured_time) {
            measured_time = new Date();
        } else {
            measured_time = new Date(measured_time);
        }

        // batch_id 값을 가져옵니다.
        const batch_id = await getFermentingBatchId();

        // 가장 처음 측정된 시간을 가져옵니다.
        const firstMeasurement = await SensorMeasurement.findOne({
            where: { batch_id },
            order: [['measured_time', 'ASC']],
            attributes: ['measured_time'],
        });

        // relative_time을 계산합니다.
        let relative_time = firstMeasurement
            ? (measured_time - new Date(firstMeasurement.measured_time)) / 1000
            : 0;

        const newSensorMeasurement = await SensorMeasurement.create({
            measured_time: measured_time,
            co2_concentration: co2_concentration || null,
            in_temperature: in_temperature || null,
            pressure_upper: pressure_upper || null,
            relative_time,

            // 매번 null로 전달될 것으로 예상되는 값들
            brix: brix || null,
            out_temperature: out_temperature || null,
            ph: ph || null,
            pressure_lower: pressure_lower || null,
        });

        // 데이터베이스에 새 데이터가 추가된 후 클라이언트에게 응답
        res.status(201).json(newSensorMeasurement);
    } catch (error) {
        // 에러 발생 시 클라이언트에게 에러 메시지 반환

        res.status(500).json({ error: error.message });
    }
});

router.get('/sensor/temperature', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const temperatureData = await getSensorDataByBatchIds(
            batchIds,
            'in_temperature',
        );
        res.json(temperatureData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/sensor/co2', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const co2Data = await getSensorDataByBatchIds(
            batchIds,
            'co2_concentration',
        );

        res.json(co2Data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/sensor/pressure', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const pressureData = await getSensorDataByBatchIds(
            batchIds,
            'pressure_upper',
        );

        res.json(pressureData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/sensor/dashboard/temperature', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const temperatureData = await getSensorDataByBatchIdDashboard(
            batchIds,
            'in_temperature',
        );
        res.json(temperatureData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/sensor/dashboard/co2', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const co2Data = await getSensorDataByBatchIdDashboard(
            batchIds,
            'co2_concentration',
        );

        res.json(co2Data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/sensor/dashboard/pressure', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const pressureData = await getSensorDataByBatchIdDashboard(
            batchIds,
            'pressure_upper',
        );

        res.json(pressureData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/sensor/latest', async (req, res) => {
    try {
        // 요청에서 batchIds를 추출 (예: ?batchIds=1)
        const batchId = req.query.batchId;

        if (!batchId) {
            return res
                .status(400)
                .json({ error: 'batchId query parameter is required' });
        }

        // getLatestSensorDataByBatchId 함수 호출
        const latestTwoSensorData = await getLatestSensorDataByBatchId(batchId);

        if (latestTwoSensorData.length < 2) {
            return res
                .status(400)
                .json({ error: 'Not enough data to calculate difference' });
        }

        // Extract the latest and previous sensor data
        const latestData = latestTwoSensorData[0];
        const previousData = latestTwoSensorData[1];

        // Calculate the differences and percentage differences
        const co2Difference = parseFloat(
            (
                latestData.co2_concentration - previousData.co2_concentration
            ).toFixed(3),
        );
        const co2PercentageDifference = parseFloat(
            ((co2Difference / previousData.co2_concentration) * 100).toFixed(3),
        );

        const tempDifference = parseFloat(
            (
                parseFloat(latestData.in_temperature) -
                parseFloat(previousData.in_temperature)
            ).toFixed(3),
        );
        const tempPercentageDifference = parseFloat(
            (
                (tempDifference / parseFloat(previousData.in_temperature)) *
                100
            ).toFixed(3),
        );

        const pressureDifference = parseFloat(
            (
                parseFloat(latestData.pressure_upper) -
                parseFloat(previousData.pressure_upper)
            ).toFixed(3),
        );
        const pressurePercentageDifference = parseFloat(
            (
                (pressureDifference / parseFloat(previousData.pressure_upper)) *
                100
            ).toFixed(3),
        );

        console.log('데이터', {
            latestData: latestData,
            differences: {
                co2_concentration: co2Difference,
                in_temperature: tempDifference,
                pressure_upper: pressureDifference,
            },
            percentageDifferences: {
                co2_concentration: co2PercentageDifference,
                in_temperature: tempPercentageDifference,
                pressure_upper: pressurePercentageDifference,
            },
        });
        // 결과 반환
        res.json({
            latestData: latestData,
            differences: {
                co2_concentration: co2Difference,
                in_temperature: tempDifference,
                pressure_upper: pressureDifference,
            },
            percentageDifferences: {
                co2_concentration: co2PercentageDifference,
                in_temperature: tempPercentageDifference,
                pressure_upper: pressurePercentageDifference,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// 알림 조회 API
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await Alert.findAll({
            order: [['alert_id', 'DESC']],

            logging: console.log, // 쿼리 로그 추가
        });
        res.json(alerts);
    } catch (error) {
        console.error('알림 조회 중 오류 발생:', error);
        res.status(500).json({
            error: '알림을 가져오는 데 오류가 발생했습니다.',
        });
    }
});

router.post('/download-excel', async (req, res) => {
    try {
        const { batchIds } = req.body;
        const excelBuffer = await createExcelFileForBatchIds(batchIds);

        res.setHeader(
            'Content-Disposition',
            'attachment; filename="sensor_data.xlsx"',
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.send(excelBuffer);
    } catch (err) {
        res.status(500).send('Error generating Excel file');
    }
});

// 테스트용 라우터
router.get('/test', async (req, res) => {
    try {
        const batchId = await getFermentingBatchId();

        if (batchId !== null) {
            res.json({ batchId });
        } else {
            res.status(404).send('No fermenting batch found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// 입고, 출고, 재고 정보를 가져오는 API
router.post('/material/receipt', async (req, res) => {
    const { materialName, quantity, unitPrice, description, category, unit } =
        req.body;

    try {
        // 새로운 원료명 추가 처리
        let rawMaterial = await db.RawMaterial.findOne({
            where: { raw_material_name: materialName },
        });

        if (!rawMaterial) {
            rawMaterial = await db.RawMaterial.create({
                raw_material_name: materialName,
                category: category || '기본 카테고리',
                unit: unit || 'kg',
                today_stock: 0,
                description: description,
            });
        }

        // 원료 입고 정보 저장
        await db.RawMaterialReceipt.create({
            raw_material_id: rawMaterial.raw_material_id,
            quantity,
            unit_price: unitPrice,
            description,
        });

        // today_stock 업데이트 (입고량 더하기)
        rawMaterial.today_stock += parseFloat(quantity);
        await db.RawMaterial.update(
            { today_stock: db.sequelize.literal(`today_stock + ${parseFloat(quantity)}`) }, // db덧셈이 안돼서 literal를 사용
            { where: { raw_material_id: rawMaterial.raw_material_id } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving material receipt:', error);
        res.status(500).json({ success: false });
    }
});

router.get('/material/unit', async (req, res) => {
    const { name, id } = req.query;  // 이름(name) 또는 ID(id) 중 하나를 받을 수 있도록 설정

    try {
        let material;

        // id가 존재하면 id로 조회, 없으면 name으로 조회
        if (id) {
            material = await db.RawMaterial.findOne({
                where: { raw_material_id: id },  // ID로 조회
            });
        } else if (name) {
            material = await db.RawMaterial.findOne({
                where: { raw_material_name: name },  // 이름으로 조회
            });
        }

        if (material) {
            res.json({ unit: material.unit });
        } else {
            res.status(404).json({ unit: null });
        }
    } catch (error) {
        console.error('Error fetching material unit:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/material/usage', async (req, res) => {
    const { materialName, quantity, batchId, description } = req.body;

    try {
        // 원료 찾기
        const rawMaterial = await db.RawMaterial.findOne({
            where: { raw_material_name: materialName },
        });

        if (!rawMaterial) {
            return res
                .status(404)
                .json({ success: false, message: '원료를 찾을 수 없습니다.' });
        }

        // 출고 정보 저장
        await db.RawMaterialUsage.create({
            raw_material_id: rawMaterial.raw_material_id,
            quantity_used: quantity,
            batch_id: batchId,
            description,
        });

        // today_stock 업데이트 (출고량 빼기)
        rawMaterial.today_stock -= parseFloat(quantity);
        await rawMaterial.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving material usage:', error);
        res.status(500).json({ success: false });
    }
});

// 재고 정보 조회
router.get('/material/inventory', async (req, res) => {
    const { name } = req.query;

    try {
        const material = await db.RawMaterial.findOne({
            where: { raw_material_name: name },
        });
        if (material) {
            res.json({
                success: true,
                today_stock: material.today_stock || 0,
                unit: material.unit,
            });
        } else {
            res.status(404).json({
                success: false,
                message: '원료를 찾을 수 없습니다.',
            });
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ success: false });
    }
});

// 재고 정보 수정
router.put('/material/inventory', async (req, res) => {
    const { materialName, newInventory } = req.body;

    try {
        const material = await db.RawMaterial.findOne({
            where: { raw_material_name: materialName },
        });

        if (!material) {
            return res.status(404).json({ success: false, message: '원료를 찾을 수 없습니다.' });
        }

        // 기존 로직 수정: today_stock 필드를 직접 업데이트
        material.today_stock = newInventory;

        await material.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ success: false });
    }
});

router.get('/sensor/excel', async (req, res) => {
    try {
        const batchId = req.query.batchId; // Batch ID 가져오기
        console.log('Batch ID:', batchId); // Batch ID가 제대로 전달되는지 확인

        // 데이터베이스에서 Batch ID에 해당하는 모든 측정 데이터를 가져오기
        const sensorData = await SensorMeasurement.findAll({
            where: { batch_id: batchId }, // Batch ID를 조건으로 설정
            attributes: ['measured_time', 'in_temperature'], // 필요한 데이터만 선택
        });
        res.json(sensorData); // JSON 형식으로 클라이언트에 반환
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).send('Server Error');
    }
});

const multer = require('multer');
const upload = multer();  // multer 설정 (파일 업로드 없이 사용)

router.post('/recipe/add', upload.none(), async (req, res) => {  // `upload.none()`으로 파일 없이 multipart 처리
    try {
        const { recipe_name, product_name, materials } = req.body;

        // 재료 정보 확인
        console.log('Received Data:', req.body);
        console.log('Materials:', materials);

        // 재료 정보를 처리하기 위해 원재료 데이터 가져오기
        const materialsWithNames = await Promise.all(materials.map(async (material) => {
            const rawMaterial = await db.RawMaterial.findByPk(material.raw_material_id);
            return {
                raw_material_id: material.raw_material_id,
                quantity: material.quantity,
                raw_material_name: rawMaterial ? rawMaterial.raw_material_name : 'Unknown'
            };
        }));

        // 레시피 및 재료 저장
        await db.Recipe.create({
            recipe_name,
            product_name,
            recipe_detail: materialsWithNames
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({ success: false, error: 'Failed to save recipe' });
    }
});


module.exports = router;
