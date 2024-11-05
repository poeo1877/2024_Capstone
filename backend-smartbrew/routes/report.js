const express = require('express');
const router = express.Router();
const { RawMaterial, RawMaterialReceipt, RawMaterialUsage } = require('../models'); // models/index.js를 통해 가져옴

const db = require("../models"); // models/index.js
const { json, DatabaseError } = require("sequelize");

// 원료수불부 페이지 라우터
router.get('/', async (req, res) => {  // 기본 경로를 '/'로 설정
    try {
        // 데이터베이스에서 입고, 출고, 재고 데이터를 가져옴
        const receipts = await db.RawMaterialReceipt.findAll({
            include: { model: db.RawMaterial, attributes: ['raw_material_name', 'supplier_name','unit','description', 'category'] },
            order :[['created_at', 'DESC']],  // 최신 데이터가 위로 오도록 정렬
        });

        const usages = await db.RawMaterialUsage.findAll({
            include: { model: db.RawMaterial, attributes: ['raw_material_name','unit', 'category'] },
            order: [['created_at', 'DESC']],  // 최신 데이터가 위로 오도록 정렬
        });

        const rawMaterials = await db.RawMaterial.findAll({
            attributes: ['raw_material_name','unit','description','today_stock', 'category'],  // 필요한 필드만 가져오기
            include: [
                {
                    model: db.RawMaterialReceipt,
                    attributes: ['quantity']
                },
                {
                    model: db.RawMaterialUsage,
                    attributes: ['quantity_used']
                }
            ]
        });
        
        // 데이터를 EJS 템플릿으로 전달
        res.render('report', { receipts, usages, rawMaterials });
    } catch (error) {
        console.error('Error fetching data for the report:', error.stack);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;