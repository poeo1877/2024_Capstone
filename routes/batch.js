var express = require('express');
var router = express.Router();
const { Batch, Recipe, Fermenter, SensorMeasurement, rawMaterials } = require('../models');
const { getSensorDataByBatchIds } = require('../services/db_services');

const db = require("../models"); // /models/index.js를 import
const { json, DatabaseError } = require("sequelize");
const { DESCRIBE } = require('sequelize/lib/query-types');
const product = require('../models/product');


router.get('/list', async (req, res) => {
    try {
        // Batch와 Recipe를 조인하여 데이터 가져오기
        const batches = await db.Batch.findAll({
            include: [
                {
                    model: Recipe,
                    attributes: ['recipe_name'], // 필요한 recipe_name만 가져오기
                },
                {
                    model: Fermenter,
                    attributes: ['status', 'fermenter_line'], // 필요한 status, fermenter_line만 가져오기
                },
            ],
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
        const rawMaterials = await db.RawMaterial.findAll({});
        // EJS 템플릿에 데이터를 전달하여 렌더링
        res.render('batch/create', { recipes, fermenters, rawMaterials });
    } catch (error) {
        console.error('Error fetching batch list:', error);
        res.status(500).send('Internal Server Error');
    }
});

// 배치 생성 POST 요청
router.post('/create', async (req, res) => {
    const { recipe_id, fermenter_id, ratio } = req.body;

    if (!recipe_id || !fermenter_id) {
        return res.status(400).json({ error: '레시피와 발효조를 선택하세요.' });
    }

    if (!ratio || ratio <= 0) {
        ratio = 1;  // 기본 비율
    }
    
    try {
        const newBatch = await Batch.create({
            start_time: new Date(), // 현재 시간
            end_time: null, // 초기값으로 null 설정
            recipe_ratio: ratio, // 초기값으로 공백 설정
            recipe_id: recipe_id,
            fermenter_id: fermenter_id,
        });

        // 레시피에 저장된 재료 정보 가져오기
        const recipe = await db.Recipe.findOne({ where: { recipe_id } });
        const materials = JSON.parse(recipe.recipe_detail);

        // 재료마다 출고 처리
        for (let material of materials) {
            const adjustedQuantity = material.quantity * ratio;
            // quantity 값이 null이 아닌지 확인
            if (!material.quantity || material.quantity <= 0 || !material.raw_material_id) {
                console.error(`Invalid data for material: ${JSON.stringify(material)}`);
                continue;  // 잘못된 데이터는 건너뜀
            }

            await db.RawMaterialUsage.create({
                raw_material_id: material.raw_material_id,
                quantity_used: adjustedQuantity,  // 사용량
                batch_id: newBatch.batch_id,
                description : `${recipe.product_name}에서 사용`,
            });

        // 재고에서 해당 재료 출고 처리
            await db.RawMaterial.update(
                { today_stock: db.sequelize.literal(`today_stock - ${material.quantity}`) },
                { where: { raw_material_id: material.raw_material_id } }
            );
        }

        res.status(201).json({ success: true, batch: newBatch });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/archive', async (req, res) => {
    try {
        //list에서 사용자가 체크해서 넘어온 설정값을 변수에 저장하였다고 가정
        var batchIds = req.query.batchIds.split(',');

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

router.get('/pan', async (req, res) => {


    res.render('test.ejs', {
        title: "test",
    });
});

router.get('/:id', (req, res) => {
    const batchId = req.params.id;
    // 데이터베이스에서 배치 정보 조회
    // ...
    res.render('batch/dashboard', { batchId }); // 'batchDetail'은 뷰 파일 이름
});

module.exports = router;
