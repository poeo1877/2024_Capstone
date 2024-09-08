var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/dashboard', async (req, res) => {
    res.render('dashboard.ejs');
});

module.exports = router;
