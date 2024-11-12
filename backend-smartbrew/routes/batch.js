var express = require('express');
var router = express.Router();
const {
    Batch,
    Recipe,
    Fermenter,
    SensorMeasurement,
    rawMaterials,
} = require('../models');
const { getSensorDataByBatchIds } = require('../services/db_services');

const db = require('../models'); // /models/index.js를 import

const fs = require('fs');
const axios = require('axios');
const path = require('path');

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
        const rawMaterials = await db.RawMaterial.findAll({
            attributes: ['raw_material_id', 'raw_material_name', 'unit'],
        });

        // rawMaterial 데이터를 사용해 recipe_detail에 unit 정보 추가
        const recipesWithUnits = recipes.map((recipe) => {
            let recipeDetail = [];

            // recipe_detail을 JSON 파싱
            try {
                recipeDetail = JSON.parse(recipe.recipe_detail);
            } catch (error) {
                console.error('Error parsing recipe_detail:', error);
            }

            // 각 재료에 대해 unit 정보 추가
            const recipeDetailWithUnits = Array.isArray(recipeDetail)
                ? recipeDetail.map((material) => {
                      const materialInfo = rawMaterials.find(
                          (rm) =>
                              rm.raw_material_id === material.raw_material_id,
                      );
                      return {
                          ...material,
                          unit: materialInfo ? materialInfo.unit : '',
                      };
                  })
                : [];

            return {
                ...recipe.toJSON(),
                recipe_detail: recipeDetailWithUnits,
            };
        });

        // EJS 템플릿에 데이터를 전달하여 렌더링
        res.render('batch/create', {
            recipes: recipesWithUnits,
            fermenters,
            rawMaterials,
        });
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
        ratio = 1; // 기본 비율
    }

    try {
        // 레시피에 저장된 재료 정보 가져오기
        const recipe = await db.Recipe.findOne({ where: { recipe_id } });
        const materials = JSON.parse(recipe.recipe_detail);

        // 출고할 각 재료의 재고가 충분한지 확인
        for (let material of materials) {
            const adjustedQuantity = material.quantity * ratio;

            // 재고 확인
            const rawMaterial = await db.RawMaterial.findOne({
                where: { raw_material_id: material.raw_material_id },
            });

            if (!rawMaterial || rawMaterial.today_stock < adjustedQuantity) {
                return res.status(400).json({ error: '재고 부족' });
            }
        }

        const newBatch = await Batch.create({
            start_time: new Date(), // 현재 시간
            end_time: null, // 초기값으로 null 설정
            recipe_ratio: ratio, // 초기값으로 공백 설정
            recipe_id: recipe_id,
            fermenter_id: fermenter_id,
        });

        await Fermenter.update(
            { status: 'FERMENTING' },
            { where: { fermenter_id: fermenter_id } },
        );

        // 재료마다 출고 처리
        for (let material of materials) {
            const adjustedQuantity = material.quantity * ratio;
            // quantity 값이 null이 아닌지 확인
            if (
                !material.quantity ||
                material.quantity <= 0 ||
                !material.raw_material_id
            ) {
                console.error(
                    `Invalid data for material: ${JSON.stringify(material)}`,
                );
                continue; // 잘못된 데이터는 건너뜀
            }

            await db.RawMaterialUsage.create({
                raw_material_id: material.raw_material_id,
                quantity_used: adjustedQuantity, // 사용량
                batch_id: newBatch.batch_id,
                description: `${recipe.product_name}에서 사용`,
            });

            // 재고에서 해당 재료 출고 처리
            await db.RawMaterial.update(
                {
                    today_stock: db.sequelize.literal(
                        `today_stock - ${adjustedQuantity}`,
                    ),
                },
                { where: { raw_material_id: material.raw_material_id } },
            );
        }

        res.status(201).json({ success: true, batch: newBatch });
    } catch (error) {
        console.error('Error creating batch:', error);
        res.status(500).json({ error: 'Database error' });
    }
});
// FastAPI 서버에서 SVG 파일 경로를 포함한 JSON 데이터를 받아오는 함수
async function getSvgFilePaths(batchId) {
    try {
        // FastAPI 서버로 POST 요청을 보내어 batchId에 해당하는 분석 결과를 받음
        const response = await axios.post('http://127.0.0.1:8000/analyze/', {
            batch_id: batchId,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching SVG file paths from FastAPI:', error);
        throw error;
    }
}

// Function to save SVG content to files
async function saveSvgFiles(batchId) {
    try {
        const result = await getSvgFilePaths(batchId);

        // Assuming the result contains SVG content (value) for histograms, volatility analysis, and change point detection
        const allSvgContents = [
            { type: 'histograms', content: result.histograms },
            {
                type: 'volatility_analysis',
                content: result.volatility_analysis,
            },
            {
                type: 'change_point_detection',
                content: result.change_point_detection,
            },
            {
                type: 'clustring',
                content: result.clustring,
            },
        ];

        // Iterate over each SVG content and save to a file
        for (const svgCategory of allSvgContents) {
            for (const svgContent of svgCategory.content) {
                // Determine the type (temperature or co2) and construct the file name accordingly
                let typePrefix = ''; // Either 'temperature' or 'co2'

                if (svgCategory.type === 'histograms') {
                    // Histograms: First SVG is for temperature, second is for CO2
                    if (svgContent.includes('온도')) {
                        // Check if the content is related to temperature
                        typePrefix = 'temperature';
                    } else {
                        typePrefix = 'co2';
                    }
                } else if (svgCategory.type === 'volatility_analysis') {
                    // Volatility Analysis: First SVG is for temperature, second is for CO2
                    if (svgContent.includes('온도')) {
                        typePrefix = 'temperature';
                    } else {
                        typePrefix = 'co2';
                    }
                } else if (svgCategory.type === 'change_point_detection') {
                    // Change Point Detection: First SVG is for temperature, second is for CO2
                    if (svgContent.includes('온도')) {
                        typePrefix = 'temperature';
                    } else {
                        typePrefix = 'co2';
                    }
                } else if (svgCategory.type === 'clustring') {
                    // Change Point Detection: First SVG is for temperature, second is for CO2
                    if (svgContent.includes('온도')) {
                        typePrefix = 'temperature';
                    } else {
                        typePrefix = 'co2';
                    }
                }

                // Construct the file name based on the type (temperature/co2) and analysis type
                const fileName = `${typePrefix}_${svgCategory.type}_${batchId}.svg`;
                const filePath = path.join(
                    'public',
                    'images',
                    'svgs',
                    fileName,
                ); // Save to 'svgs' directory

                // Ensure the 'svgs' directory exists
                if (!fs.existsSync(path.dirname(filePath))) {
                    fs.mkdirSync(path.dirname(filePath), { recursive: true });
                }

                // Check if svgContent is a string (the actual SVG markup) and save it to file
                if (typeof svgContent === 'string') {
                    fs.writeFileSync(filePath, svgContent);
                    console.log(`SVG saved to: ${filePath}`);
                } else {
                    console.error(
                        'Invalid SVG content format, expected string',
                    );
                }
            }
        }
    } catch (error) {
        console.error('Error saving SVG files:', error);
    }
}

router.get('/archive', async (req, res) => {
    try {
        //list에서 사용자가 체크해서 넘어온 설정값을 변수에 저장하였다고 가정
        var batchIds = req.query.batchIds.split(',');
        for (const batchId of batchIds) {
            saveSvgFiles(batchId);
        }
        const data = await getSensorDataByBatchIds(batchIds, 'in_temperature');
        // data가 배열인지 확인 (에러 방지)
        if (!Array.isArray(data)) {
            throw new Error('Expected data to be an array');
        }
        res.render('batch-archive.ejs', {
            title: 'archive',
            batchIds: JSON.stringify(batchIds),
            temperatureData: JSON.stringify(data),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/pan', async (req, res) => {
    res.render('test.ejs', {
        title: 'test',
    });
});

router.get('/:id', (req, res) => {
    const batchId = req.params.id;
    // 데이터베이스에서 배치 정보 조회
    // ...
    res.render('batch/dashboard', { batchId }); // 'batchDetail'은 뷰 파일 이름
});

module.exports = router;
