var express = require('express');
var router = express.Router();
const db = require('../models'); // /models/index.js를 import
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const duration = require('dayjs/plugin/duration');
dayjs.extend(duration);
const { Client } = require('ssh2');

const {
    SensorMeasurement,
    Alert,
    Batch,
    Fermenter,
    DashboardLimit,
} = require('../models');
const {
    getSensorDataByBatchIds,
    getLatestSensorDataByBatchId,
    createExcelFileForBatchIds,
    getFermentingBatchId,
    getSensorDataByBatchIdDashboard,
    getLatestSensorDashboardByBatchId,
    createExcelForMaterials,
} = require('../services/db_services');
const { analyzeBatch } = require('../services/fastapi_service');

let isStopped = false;

const { sendTelegramMessage } = require('../services/telegram_bot');

const checkAlert = async (measurement) => {
    try {
        const currentTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
        console.log(currentTime);

        // measurement의 측정 시간을 조회
        const measuredTime = new Date(measurement.measured_time);

        // 각각의 센서 타입에 대해 경계값 조회
        const temperatureLimits = await DashboardLimit.findAll({
            where: {
                sensor_type: 'temperature',
                startdate: {
                    [Op.lte]: measuredTime, // startdate가 측정 시간보다 작거나 같은 것만 조회
                },
                enddate: {
                    [Op.gte]: measuredTime, // enddate가 측정 시간보다 크거나 같은 것만 조회
                },
            },
            order: [['limit_id', 'DESC']],
        });

        const co2Limits = await DashboardLimit.findAll({
            where: {
                sensor_type: 'co2',
                startdate: {
                    [Op.lte]: measuredTime,
                },
                enddate: {
                    [Op.gte]: measuredTime,
                },
            },
            order: [['limit_id', 'DESC']],
        });

        const pHLimits = await DashboardLimit.findAll({
            where: {
                sensor_type: 'ph',
                startdate: {
                    [Op.lte]: measuredTime,
                },
                enddate: {
                    [Op.gte]: measuredTime,
                },
            },
            order: [['limit_id', 'DESC']],
        });

        let alerts = [];

        // 온도 경계값 체크
        if (temperatureLimits.length > 0) {
            const limit = temperatureLimits[0];
            if (measurement.in_temperature > limit.upper_limit) {
                const exceedAmount =
                    measurement.in_temperature - limit.upper_limit;
                alerts.push(
                    `온도가 상한값을 ${exceedAmount.toFixed(
                        2,
                    )}도 초과했습니다!`,
                );
            } else if (measurement.in_temperature < limit.lower_limit) {
                const belowAmount =
                    limit.lower_limit - measurement.in_temperature;
                alerts.push(
                    `온도가 하한값보다 ${belowAmount.toFixed(2)}도 낮습니다!`,
                );
            }
        }

        // CO2 경계값 체크
        if (co2Limits.length > 0) {
            const limit = co2Limits[0];
            if (measurement.co2_concentration > limit.upper_limit) {
                const exceedAmount =
                    measurement.co2_concentration - limit.upper_limit;
                alerts.push(
                    `CO2 농도가 상한값을 ${exceedAmount.toFixed(
                        2,
                    )}ppm 초과했습니다!`,
                );
            } else if (measurement.co2_concentration < limit.lower_limit) {
                const belowAmount =
                    limit.lower_limit - measurement.co2_concentration;
                alerts.push(
                    `CO2 농도가 하한값보다 ${belowAmount.toFixed(
                        2,
                    )}ppm 낮습니다!`,
                );
            }
        }

        // 압력 경계값 체크
        if (pHLimits.length > 0) {
            const limit = pHLimits[0];
            if (measurement.ph > limit.upper_limit) {
                const exceedAmount = measurement.ph - limit.upper_limit;
                alerts.push(
                    `pH가 상한값을 ${exceedAmount.toFixed(2)}pH 초과했습니다!`,
                );
            } else if (measurement.ph < limit.lower_limit) {
                const belowAmount = limit.lower_limit - measurement.ph;
                alerts.push(
                    `pH가 하한값보다 ${belowAmount.toFixed(2)}pH 낮습니다!`,
                );
            }
        }

        // 모든 알림 메시지가 있다면 클라이언트로 전송 및 DB에 저장
        if (alerts.length > 0) {
            for (const message of alerts) {
                // 데이터베이스에 알림 추가
                await Alert.create({
                    alert_message: message,
                    alert_time: currentTime,
                });

                // Telegram으로 알림 전송
                await sendTelegramMessage(message);
            }
        } else {
            console.log('모든 센서가 정상 범위에 있습니다.');
        }
    } catch (error) {
        console.error('경계값 체크 중 오류 발생:', error);
    }
};
// 특정 batch_id에 대한 CO₂ 농도 업데이트 함수
async function updateCO2ConcentrationsForBatch(batch_id) {
    const initialVolume = 50; // 초기 부피 (L)
    const finalVolume = 200; // 48시간 후 부피 (L)
    const totalVolume = 200; // 전체 부피 (L)
    const initialV = 29.25882; // 초기 차감 부피 (L)
    const V1 = 69.27126; // 48시간 후 추가 차감 부피 (L)
    const V2 = 36.5853; // 96시간 후 추가 차감 부피 (L)
    const batch = await Batch.findOne({ where: { batch_id: batch_id } });
    if (!batch) {
        return res.status(404).json({ error: 'Batch not found.' });
    }
    const recipe_ratio = batch.recipe_ratio;
    const adjustedInitialV = initialV * recipe_ratio;
    const adjustedV1 = V1 * recipe_ratio;
    const adjustedV2 = V2 * recipe_ratio;

    const firstMeasurement = await SensorMeasurement.findOne({
        where: { batch_id },
        order: [['measured_time', 'ASC']],
        attributes: ['measured_time'],
    });

    let volume = (initialVolume - adjustedInitialV) / 1000; // 초기 부피 설정

    try {
        // 특정 batch_id에 해당하는 데이터만 가져옴
        const measurements = await SensorMeasurement.findAll({
            where: { batch_id },
            attributes: [
                'data_id',
                'pressure_upper',
                'relative_time',
                'out_temperature',
            ],
        });

        // 각 측정 데이터에 대해 FastAPI 서버에 요청
        for (const measurement of measurements) {
            const { data_id, pressure_upper, relative_time, out_temperature } =
                measurement;

            // 필요한 데이터가 없는 경우 건너뜀
            if (
                pressure_upper == null ||
                relative_time == null ||
                out_temperature == null
            ) {
                console.warn(
                    `Skipping data_id ${data_id} due to missing fields.`,
                );
                continue;
            }
            if (relative_time >= 96 * 3600) {
                volume =
                    (finalVolume - adjustedInitialV - adjustedV1 - adjustedV2) /
                    1000;
            } else if (relative_time >= 48 * 3600) {
                volume = (finalVolume - adjustedInitialV - adjustedV1) / 1000;
            }
            out_temperature_m = out_temperature + 273;
            pressure_upper_m = pressure_upper * 100;
            relative_time_m = relative_time / 86400;
            try {
                const transformedData = {
                    out_temperature: out_temperature_m, // 섭씨에서 켈빈으로 변환
                    pressure_upper: pressure_upper_m, // hPa에서 Pa로 변환
                    relative_time: relative_time_m, // 초를 일(day) 단위로 변환
                    volume: volume, // 필요시 변경할 부피 값
                };
                // FastAPI 서버에 데이터 전송
                const response = await axios.post(
                    'http://127.0.0.1:8000/predict_co2',
                    transformedData,
                );

                const co2_concentration_calculated =
                    response.data.co2_concentration * 1e6;

                // 예측된 CO₂ 농도로 업데이트
                await SensorMeasurement.update(
                    { co2_concentration: co2_concentration_calculated },
                    { where: { data_id } },
                );

                console.log(
                    `Updated record data_id ${data_id} with CO₂ concentration: ${co2_concentration_calculated}`,
                );
            } catch (fastApiError) {
                console.error(
                    `FastAPI 서버 요청 실패: data_id ${data_id}`,
                    fastApiError.message,
                );
            }
        }

        console.log(`Batch ID ${batch_id}의 CO₂ 농도 업데이트 완료`);
    } catch (error) {
        console.error('데이터 업데이트 중 에러 발생:', error.message);
    }
}

// updateCO2ConcentrationsForBatch(12);

// 정지 상태를 설정하는 라우터
router.post('/sensor/start', (req, res) => {
    isStopped = false; // 정지 상태로 설정
    res.status(200).json({ message: 'Sensor stopped successfully.' });
});

// 정지 상태를 설정하는 라우터
router.post('/sensor/pause', (req, res) => {
    isStopped = true; // 정지 상태로 설정
    res.status(200).json({ message: 'Sensor stopped successfully.' });
});

// 정지 상태를 설정하고 fermenter 테이블의 상태를 업데이트하는 라우터
router.post('/sensor/stop', async (req, res) => {
    try {
        // 현재 fermenting batch ID 가져오기
        const batch_id = await getFermentingBatchId();

        // batch_id에 해당하는 fermenter_id 조회
        const batch = await Batch.findOne({
            where: { batch_id },
            attributes: ['fermenter_id'],
        });

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found.' });
        }

        const fermenter_id = batch.fermenter_id;

        // fermenter 테이블의 상태를 COMPLETED로 업데이트
        await Fermenter.update(
            { status: 'COMPLETED' },
            {
                where: { fermenter_id: fermenter_id },
            },
        );

        res.status(200).json({
            message:
                'Sensor stopped successfully and fermenter status updated.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/sensor/measurement: # 경로
 *  post: # HTTP 메서드
 *  summary: 라즈베리파이로 측정한 센서 데이터를 DB에 저장  # 요약
 */
router.post('/sensor/measurement', async (req, res) => {
    const initialVolume = 50; // 초기 부피 (L)
    const finalVolume = 200; // 48시간 후 부피 (L)
    const totalVolume = 200; // 전체 부피 (L)
    const initialV = 29.25882; // 초기 차감 부피 (L)
    const V1 = 69.27126; // 48시간 후 추가 차감 부피 (L)
    const V2 = 36.5853; // 96시간 후 추가 차감 부피 (L)

    if (isStopped) {
        return res.status(403).json({ error: 'Data storage is stopped.' });
    }

    try {
        let {
            brix,
            measured_time,
            out_temperature,
            in_temperature,
            ph,
            pressure_upper,
        } = req.body;

        measured_time = measured_time ? new Date(measured_time) : new Date();
        const batch_id = await getFermentingBatchId();

        const batch = await Batch.findOne({ where: { batch_id: batch_id } });
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found.' });
        }

        const recipe_ratio = batch.recipe_ratio;
        const adjustedInitialV = initialV * recipe_ratio;
        const adjustedV1 = V1 * recipe_ratio;
        const adjustedV2 = V2 * recipe_ratio;

        const firstMeasurement = await SensorMeasurement.findOne({
            where: { batch_id },
            order: [['measured_time', 'ASC']],
            attributes: ['measured_time'],
        });

        let relative_time = 0;
        let volume = (initialVolume - adjustedInitialV) / 1000; // 초기 부피 설정

        if (firstMeasurement) {
            const firstMeasuredTime = new Date(firstMeasurement.measured_time);
            relative_time = (measured_time - firstMeasuredTime) / 1000; // 초 단위로 변환

            if (relative_time >= 96 * 3600) {
                volume =
                    (finalVolume - adjustedInitialV - adjustedV1 - adjustedV2) /
                    1000;
            } else if (relative_time >= 48 * 3600) {
                volume = (finalVolume - adjustedInitialV - adjustedV1) / 1000;
            }
        }

        if (out_temperature != null && pressure_upper != null) {
            try {
                const response = await axios.post(
                    'http://127.0.0.1:8000/predict_co2',
                    {
                        out_temperature: out_temperature + 273.15,
                        pressure_upper: pressure_upper * 100,
                        relative_time: relative_time / 86400,
                        volume: volume,
                    },
                );

                const co2_concentration_calculated =
                    response.data.co2_concentration * 1e6;

                const newSensorMeasurement = await SensorMeasurement.create({
                    measured_time,
                    co2_concentration: co2_concentration_calculated,
                    in_temperature: in_temperature || null,
                    pressure_upper: pressure_upper || null,
                    relative_time,
                    batch_id,
                    brix: brix || null,
                    out_temperature: out_temperature || null,
                    ph: ph || null,
                });

                await checkAlert(newSensorMeasurement);
                res.status(201).json(newSensorMeasurement);
            } catch (fastApiError) {
                console.error('FastAPI 서버 에러:', fastApiError);
                res.status(500).json({
                    error: 'Failed to calculate CO₂ concentration from FastAPI server.',
                });
            }
        } else {
            res.status(400).json({
                error: 'Temperature and pressure are required to calculate CO₂ concentration.',
            });
        }
    } catch (error) {
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

router.get('/sensor/ph', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const pHData = await getSensorDataByBatchIds(batchIds, 'ph');

        res.json(pHData);
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

router.get('/sensor/dashboard/ph', async (req, res) => {
    try {
        const batchIds = req.query.batchId.split(','); // 쿼리에서 batchId를 가져와서 배열로 변환
        const pHData = await getSensorDataByBatchIdDashboard(batchIds, 'ph');

        res.json(pHData);
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

        const phDifference = parseFloat(
            (parseFloat(latestData.ph) - parseFloat(previousData.ph)).toFixed(
                3,
            ),
        );
        const phPercentageDifference = parseFloat(
            ((phDifference / parseFloat(previousData.ph)) * 100).toFixed(3),
        );

        console.log('데이터', {
            latestData: latestData,
            differences: {
                co2_concentration: co2Difference,
                in_temperature: tempDifference,
                ph: phDifference,
            },
            percentageDifferences: {
                co2_concentration: co2PercentageDifference,
                in_temperature: tempPercentageDifference,
                ph: phPercentageDifference,
            },
        });
        // 결과 반환
        res.json({
            latestData: latestData,
            differences: {
                co2_concentration: co2Difference,
                in_temperature: tempDifference,
                ph: phDifference,
            },
            percentageDifferences: {
                co2_concentration: co2PercentageDifference,
                in_temperature: tempPercentageDifference,
                ph: phPercentageDifference,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/sensor/dashboard/latest', async (req, res) => {
    const batchId = req.query.batchId;

    if (!batchId) {
        return res
            .status(400)
            .json({ error: 'batchId query parameter is required' });
    }

    // getLatestSensorDataByBatchId 함수 호출
    const latestTwoSensorData = await getLatestSensorDashboardByBatchId(
        batchId,
    );

    if (latestTwoSensorData.length < 2) {
        return res
            .status(400)
            .json({ error: 'Not enough data to calculate difference' });
    }

    // Extract the latest and previous sensor data
    const latestData = latestTwoSensorData[0];

    res.json({
        latestData: {
            co2_concentration: latestData.co2_concentration,
            in_temperature: latestData.in_temperature,
            pressure_upper: latestData.pressure_upper,
            measured_time: latestData.measured_time, // 측정 시간 추가
        },
    });
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
router.post('/alerts/latest', async (req, res) => {
    try {
        // 최신 알림 메시지 가져오기 (최대 5개)
        const latestAlerts = await Alert.findAll({
            order: [['alert_id', 'DESC']], // 최근 알림 순으로 정렬
            limit: 5, // 최대 5개의 알림만 가져오기
        });

        // 알림 메시지를 챗봇 출력 형식으로 변환
        const alertOutputs = latestAlerts.map((alert) => ({
            simpleText: {
                text: alert.alert_time + '+' + alert.alert_message, // 알림 메시지 필드로 바꾸기
            },
        }));

        const responseBody = {
            version: '2.0',
            template: {
                outputs: [
                    {
                        simpleText: {
                            text: '최신 알림입니다:',
                        },
                    },
                    ...alertOutputs, // 변환된 알림 메시지 추가
                ],
            },
        };

        res.status(200).send(responseBody);
    } catch (error) {
        console.error('최신 알림 조회 중 오류 발생:', error);
        res.status(500).json({
            error: '최신 알림을 가져오는 데 오류가 발생했습니다.',
        });
    }
});

router.post('/sayHello', function (req, res) {
    const responseBody = {
        version: '2.0',
        template: {
            outputs: [
                {
                    simpleText: {
                        text: "hello I'm Ryan",
                    },
                },
            ],
        },
    };

    res.status(200).send(responseBody);
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
        const batchId = 5;

        if (batchId !== null) {
            res.json(await analyzeBatch(batchId));
        } else {
            res.status(404).send('함수 실행 실패');
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
            {
                today_stock: db.sequelize.literal(
                    `today_stock + ${parseFloat(quantity)}`,
                ),
            }, // db덧셈이 안돼서 literal를 사용
            { where: { raw_material_id: rawMaterial.raw_material_id } },
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving material receipt:', error);
        res.status(500).json({ success: false });
    }
});

router.get('/material/unit', async (req, res) => {
    const { name, id } = req.query; // 이름(name) 또는 ID(id) 중 하나를 받을 수 있도록 설정

    try {
        let material;

        // id가 존재하면 id로 조회, 없으면 name으로 조회
        if (id) {
            material = await db.RawMaterial.findOne({
                where: { raw_material_id: id }, // ID로 조회
            });
        } else if (name) {
            material = await db.RawMaterial.findOne({
                where: { raw_material_name: name }, // 이름으로 조회
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
            return res
                .status(404)
                .json({ success: false, message: '원료를 찾을 수 없습니다.' });
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

// 라즈베리파이 전원 끄기
router.get('/shutdown-raspberry-pi', (req, res) => {
    const conn = new Client();

    // 라즈베리파이 SSH 접속 정보
    const raspberryPiConfig = {
        host: 'localhost', // 서버에서 라즈베리파이 접근은 localhost를 통해 이루어짐
        port: 2222, // 서버의 2222번 포트를 통해 라즈베리파이의 22번 포트로 연결
        username: 'pi', // 라즈베리파이 사용자 이름
        password: 'test1234', // 라즈베리파이 비밀번호
    };

    conn.on('ready', () => {
        console.log('SSH 연결 성공');

        // 라즈베리파이에서 poweroff 명령어 실행
        conn.exec('sudo poweroff', (err, stream) => {
            if (err) {
                console.error('명령어 실행 중 오류 발생: ', err);
                return res
                    .status(500)
                    .send('라즈베리파이 종료 중 오류가 발생했습니다.');
            }

            stream
                .on('close', (code, signal) => {
                    console.log('명령어 실행 완료: ', code, signal);
                    conn.end();

                    // 라즈베리파이 종료 메시지 전송
                    res.send(
                        '라즈베리파이가 안전하게 종료되었습니다. 전원선을 뽑아도 괜찮습니다.',
                    );
                })
                .on('data', (data) => {
                    console.log('STDOUT: ' + data);
                })
                .stderr.on('data', (data) => {
                    console.log('STDERR: ' + data);
                });
        });
    })
        .on('error', (err) => {
            // SSH 연결 실패 시 예외 처리 추가
            console.error('SSH 연결 실패: ', err);

            // 연결 실패 시에도 정상적인 응답을 보냄
            res.status(200).send(
                '라즈베리파이 종료 명령을 보낼 수 없습니다. SSH 연결이 설정되지 않았습니다.',
            );
        })
        .connect(raspberryPiConfig);
});

const multer = require('multer');
const upload = multer(); // multer 설정 (파일 업로드 없이 사용)

router.post('/recipe/add', upload.none(), async (req, res) => {
    // `upload.none()`으로 파일 없이 multipart 처리
    try {
        const { recipe_name, product_name, materials } = req.body;

        // 재료 정보 확인
        console.log('Received Data:', req.body);
        console.log('Materials:', materials);

        // 재료 정보를 처리하기 위해 원재료 데이터 가져오기
        const materialsWithNames = await Promise.all(
            materials.map(async (material) => {
                const rawMaterial = await db.RawMaterial.findByPk(
                    material.raw_material_id,
                );
                return {
                    raw_material_id: material.raw_material_id,
                    quantity: material.quantity,
                    raw_material_name: rawMaterial
                        ? rawMaterial.raw_material_name
                        : 'Unknown',
                };
            }),
        );

        // 레시피 및 재료 저장
        await db.Recipe.create({
            recipe_name,
            product_name,
            recipe_detail: materialsWithNames,
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error saving recipe:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save recipe',
        });
    }
});

router.post('/download-materials-excel', async (req, res) => {
    try {
        const { selectedData } = req.body;
        const excelBuffer = await createExcelForMaterials(selectedData);

        res.setHeader(
            'Content-Disposition',
            'attachment; filename="materials_data.xlsx"',
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.send(excelBuffer);
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).send('Failed to generate Excel file');
    }
});

module.exports = { router };
