var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
	res.render("index", { title: "Express" });
});

router.get("/dashboard", async (req, res) => {
	res.render("dashboard.ejs");
});

router.get("/report", async (req, res) => {
	res.render("report.ejs");
});

router.get('/create-batch', async (req, res) => {
    res.render('createBatch.ejs');
});

module.exports = router;
