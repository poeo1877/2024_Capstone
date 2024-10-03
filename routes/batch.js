var express = require("express");
var router = express.Router();
const { Batch, Recipe, Fermenter, SensorMeasurement } = require("../models");
const { getSensorDataByBatchIds } = require("../services/db_services");

const db = require("../models"); // /models/index.js를 import
const { json, DatabaseError } = require("sequelize");

router.get("/list", async (req, res) => {
	try {
		// Batch와 Recipe를 조인하여 데이터 가져오기
		const batches = await Batch.findAll({
			include: {
				model: Recipe,
				attributes: ["recipe_name"], // 필요한 recipe_name만 가져오기
			},
		});

		// EJS 템플릿에 데이터를 전달하여 렌더링
		res.render("batch/list", { batches });
	} catch (error) {
		console.error("Error fetching batch list:", error);
		res.status(500).send("Internal Server Error");
	}
});
router.get("/create", async (req, res) => {
	try {
		// Batch와 Recipe를 조인하여 데이터 가져오기
		const recipes = await Recipe.findAll({});
		const fermenters = await Fermenter.findAll({});
		// EJS 템플릿에 데이터를 전달하여 렌더링
		res.render("batch/create", { recipes, fermenters });
	} catch (error) {
		console.error("Error fetching batch list:", error);
		res.status(500).send("Internal Server Error");
	}
});
// 배치 생성 POST 요청
router.post("/create", async (req, res) => {
	const { recipe_id, fermenter_id } = req.body;

	if (!recipe_id || !fermenter_id) {
		return res.status(400).json({ error: "레시피와 발효조를 선택하세요." });
	}

	try {
		const newBatch = await Batch.create({
			start_time: new Date(), // 현재 시간
			end_time: null, // 초기값으로 null 설정
			recipe_ratio: "", // 초기값으로 공백 설정
			recipe_id: recipe_id,
			fermenter_id: fermenter_id,
		});

		res.status(201).json({ success: true, batch: newBatch });
	} catch (error) {
		console.error("Error creating batch:", error);
		res.status(500).json({ error: "Database error" });
	}
});

router.get("/archive", async (req, res) => {
	try {
		//list에서 사용자가 체크해서 넘어온 설정값을 변수에 저장하였다고 가정
		var batchIds = [5];

		const data = await getSensorDataByBatchIds(batchIds, "in_temperature");
		// data가 배열인지 확인 (에러 방지)
		if (!Array.isArray(data)) {
			throw new Error("Expected data to be an array");
		}
		
		res.render("batch-archive.ejs", {
			title: "archive",
			batchIds: JSON.stringify(batchIds),
			temperatureData: JSON.stringify(data),
		});
	} catch (err) {
		console.error(err);
		res.status(500).send("Server Error");
	}
});

router.get("/:id", (req, res) => {
	const batchId = req.params.id;
	// 데이터베이스에서 배치 정보 조회
	// ...
	res.render("batch/dashboard", { batchId }); // 'batchDetail'은 뷰 파일 이름
});

module.exports = router;
