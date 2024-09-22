var express = require("express");
var router = express.Router();
const moment = require("moment-timezone");

const { Client } = require("pg");

const dbClient = new Client({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	password: process.env.DB_PASS,
	port: process.env.DB_PORT,
});

dbClient.connect();

router.get("/", async (req, res) => {
	res.render("index.ejs", { title: "This is a batch list page" });
});

router.get("/archive", async (req, res) => {
	try {
		const result = await dbClient.query(
			"SELECT * FROM sensor_measurement WHERE batch_id = 5 ORDER BY data_id ASC"
		);
		const data = result.rows;
		// 날짜 형식 변환
		const timestamps = data.map((row) => {
			return moment(row.measured_time)
				.tz("Asia/Seoul")
				.format("YYYY-MM-DD HH:mm");
		});
		const dataId = data.map((row) => row.data_id);
		const temperatureData = data.map((row) => row.in_temperature);
		const co2Data = data.map((row) => row.co2_concentration);
		const pressureData = data.map((row) => row.pressure_upper);

		res.render("batch-archive.ejs", {
			title: "archive",
			timestamps: JSON.stringify(timestamps),
			dataId: JSON.stringify(dataId),
			temperatureData: JSON.stringify(temperatureData),
			co2Data: JSON.stringify(co2Data),
			pressureData: JSON.stringify(pressureData),
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
});

module.exports = router;
