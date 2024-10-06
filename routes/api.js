var express = require("express");
var router = express.Router();
const db = require("../models"); // /models/index.js를 import
const { SensorMeasurement } = require("../models");
const {
	getSensorDataByBatchIds,
	getLatestSensorDataByBatchId,
} = require("../services/db_services");

/**
 * @swagger
 * /api/sensor/measurement: # 경로
 *  post: # HTTP 메서드
 *  summary: 라즈베리파이로 측정한 센서 데이터를 DB에 저장  # 요약
 */
router.post("/sensor/measurement", async (req, res) => {
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
		const {
			co2_concentration,
			brix,
			measured_time,
			out_temperature,
			in_temperature,
			ph,
			pressure_upper,
			pressure_lower,
		} = req.body;

		const newSensorMeasurement = await SensorMeasurement.create({
			measured_time: measured_time || new Date(), // null이면 현재 시간으로 대체
			co2_concentration: co2_concentration || null,
			in_temperature: in_temperature || null,
			pressure_upper: pressure_upper || null,

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

router.get("/sensor/temperature", async (req, res) => {
	try {
		const batchIds = req.query.batchId.split(","); // 쿼리에서 batchId를 가져와서 배열로 변환
		const temperatureData = await getSensorDataByBatchIds(
			batchIds,
			"in_temperature"
		);

		res.json(temperatureData);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.get("/sensor/co2", async (req, res) => {
	try {
		const batchIds = req.query.batchId.split(","); // 쿼리에서 batchId를 가져와서 배열로 변환
		const co2Data = await getSensorDataByBatchIds(
			batchIds,
			"co2_concentration"
		);

		res.json(co2Data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.get("/sensor/pressure", async (req, res) => {
	try {
		const batchIds = req.query.batchId.split(","); // 쿼리에서 batchId를 가져와서 배열로 변환
		const pressureData = await getSensorDataByBatchIds(
			batchIds,
			"pressure_upper"
		);

		res.json(pressureData);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

router.get("/sensor/latest", async (req, res) => {
	try {
		// 요청에서 batchIds를 추출 (예: ?batchIds=1)
		const batchId = req.query.batchId;

		if (!batchId) {
			return res
				.status(400)
				.json({ error: "batchId query parameter is required" });
		}

		// getLatestSensorDataByBatchId 함수 호출
        const latestTwoSensorData = await getLatestSensorDataByBatchId(batchId);
        console.log("두 개", latestTwoSensorData);

		if (latestTwoSensorData.length < 2) {
			return res
				.status(400)
				.json({ error: "Not enough data to calculate difference" });
		}

		// Extract the latest and previous sensor data
		const latestData = latestTwoSensorData[0];
		const previousData = latestTwoSensorData[1];

		// Calculate the differences and percentage differences
		const co2Difference = parseFloat(
			(latestData.co2_concentration - previousData.co2_concentration).toFixed(3)
		);
		const co2PercentageDifference = parseFloat(
			((co2Difference / previousData.co2_concentration) * 100).toFixed(3)
		);

		const tempDifference = parseFloat(
			(parseFloat(latestData.in_temperature) - parseFloat(previousData.in_temperature)).toFixed(3)
		);
		const tempPercentageDifference = parseFloat(
			((tempDifference / parseFloat(previousData.in_temperature)) * 100).toFixed(3)
		);

		const pressureDifference = parseFloat(
			(parseFloat(latestData.pressure_upper) - parseFloat(previousData.pressure_upper)).toFixed(3)
		);
		const pressurePercentageDifference = parseFloat(
			((pressureDifference / parseFloat(previousData.pressure_upper)) * 100).toFixed(3)
		);

		console.log("데이터", {
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
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// /api/sensor/measurement API
router.get("/sensor/measurement", async (req, res) => {
    try {
        const batchId = req.query.batchId; // Batch ID 가져오기
        console.log("Batch ID:", batchId); // Batch ID가 제대로 전달되는지 확인
        
        // 데이터베이스에서 Batch ID에 해당하는 모든 측정 데이터를 가져오기
        const sensorData = await SensorMeasurement.findAll({
            where: { batch_id: batchId },  // Batch ID를 조건으로 설정
            attributes: ['measured_time', 'in_temperature'] // 필요한 데이터만 선택
        });

        res.json(sensorData); // JSON 형식으로 클라이언트에 반환
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
