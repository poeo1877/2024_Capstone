var express = require('express');
var router = express.Router();
const {
    getSensorDataByBatchIds,
    getFermentingBatchId,
    getSensorDataByBatchIdDashboard,
} = require('../services/db_services');

router.get('/dashboard', async (req, res) => {
    try {
        //list에서 사용자가 체크해서 넘어온 설정값을 변수에 저장하였다고 가정
        var batchId = await getFermentingBatchId();

        const data = await getSensorDataByBatchIdDashboard(
            batchId,
            'in_temperature',
        );
        // data가 배열인지 확인 (에러 방지)
        if (!Array.isArray(data)) {
            throw new Error('Expected data to be an array');
        }

        res.render('dashboard.ejs', {
            title: 'dashboard',
            batchId: JSON.stringify(batchId),
            temperatureData: JSON.stringify(data),
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/alert', async (req, res) => {
    res.render('alert');
});

router.get('/raw', async (req, res) => {
    res.render('raw_report');
});

router.get('/error', async (req, res) => {
    const errorNumber = req.query.error || 100;
    let errorTitle;
    let errorMessage;

    switch (parseInt(errorNumber)) {
        case 400:
            errorTitle = 'Bad Request';
            errorMessage = 'Your Request resulted in an error.';
            break;
        case 403:
            errorTitle = 'Forbidden Error!';
            errorMessage = 'You do not have permission to view this resource.';
            break;
        case 404:
            errorTitle = 'The page you were looking for is not found!';
            errorMessage =
                'You may have mistyped the address or the page may have moved.';
            break;
        case 500:
            errorTitle = 'Internal Server Error';
            errorMessage = 'Sorry, there was a problem with the server.';
            break;
        case 503:
            errorTitle = 'Service Unavailable';
            errorMessage = 'Sorry, we are under maintenance!';
            break;
        default:
            errorTitle = 'Unknown Error';
            errorMessage = 'An unknown error occurred.';
            break;
    }

    // 헤더와 푸터를 숨기고, 에러 페이지에 필요한 정보만 전달
    res.render('error.ejs', {
        errorNumber: errorNumber,
        errorTitle: errorTitle,
        errorMessage: errorMessage,
        showMenu: false, // 메뉴 숨기기
        showHeaderFooter: false, // 헤더와 푸터 숨기기
    });
});

module.exports = router;
