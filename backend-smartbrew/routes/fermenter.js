var express = require('express');
var router = express.Router();
const db = require('../models');
const { Fermenter } = require('../models');
// 발효조 추가 API
router.post('/add', async (req, res) => {
    try {
        const { fermenter_line, fermenter_volume } = req.body;
        const newFermenter = await Fermenter.create({
            fermenter_line,
            fermenter_volume,
            status: 'WAITING',
        });
        res.json({ success: true, fermenter: newFermenter });
    } catch (error) {
        console.error('발효조 추가 중 오류:', error);
        res.json({ success: false, error: error.message });
    }
});

module.exports = router;
