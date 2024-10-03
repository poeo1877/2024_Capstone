var express = require("express");
var router = express.Router();
const { getSensorDataByBatchIds } = require("../services/db_services");


/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Express" });
});

router.get("/dashboard", async (req, res) => {
	try {
		//list에서 사용자가 체크해서 넘어온 설정값을 변수에 저장하였다고 가정
		var batchId = [5];

		const data = await getSensorDataByBatchIds(batchId, "in_temperature");
		// data가 배열인지 확인 (에러 방지)
		if (!Array.isArray(data)) {
			throw new Error("Expected data to be an array");
		}
		
		res.render("dashboard.ejs", {
			title: "dashboard",
			batchId: JSON.stringify(batchId),
			temperatureData: JSON.stringify(data),
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
});

router.get("/report", async (req, res) => {
	res.render("report.ejs");
});

router.get('/create-batch', async (req, res) => {
    res.render('createBatch.ejs');
});

module.exports = router;
