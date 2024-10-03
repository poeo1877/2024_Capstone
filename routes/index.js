var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/dashboard', async (req, res) => {
    res.render('dashboard.ejs');
});

router.get('/report', async (req, res) => {
    res.render('report.ejs');
});

router.get('/create-batch', async (req, res) => {
    res.render('createBatch.ejs');
});

router.get("/error", async (req, res) => {
    const errorNumber = req.query.error || 100;
    let errorTitle;
    let errorMessage;

    switch (parseInt(errorNumber)) {
        case 400:
            errorTitle = "Bad Request";
            errorMessage = "Your Request resulted in an error.";
            break;
        case 403:
            errorTitle = "Forbidden Error!";
            errorMessage = "You do not have permission to view this resource.";
            break;
        case 404:
            errorTitle = "The page you were looking for is not found!";
            errorMessage = "You may have mistyped the address or the page may have moved.";
            break;
        case 500:
            errorTitle = "Internal Server Error";
            errorMessage = "Sorry, there was a problem with the server.";
            break;
        case 503:
            errorTitle = "Service Unavailable";
            errorMessage = "Sorry, we are under maintenance!";
            break;
        default:
            errorTitle = "Unknown Error";
            errorMessage = "An unknown error occurred.";
            break;
    }

    // 헤더와 푸터를 숨기고, 에러 페이지에 필요한 정보만 전달
    res.render("error.ejs", {
        errorNumber: errorNumber,
        errorTitle: errorTitle,
        errorMessage: errorMessage,
        showMenu: false, // 메뉴 숨기기
        showHeaderFooter: false // 헤더와 푸터 숨기기
    });
});





module.exports = router;
