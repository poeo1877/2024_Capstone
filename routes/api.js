var express = require("express");
var router = express.Router();
const db = require("../models"); // /models/index.js를 import
const { SensorMeasurement } = require("../models");

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




module.exports = router;
