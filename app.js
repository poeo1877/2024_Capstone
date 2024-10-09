var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

require('dotenv').config();

var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var DashboardRouter = require('./routes/dashboard');
var BatchRouter = require('./routes/batch');
var RecipeRouter = require('./routes/recipe');
var APIRouter = require('./routes/api');
var reportRouter = require('./routes/report');

var sequelize = require('./models/index.js').sequelize;

var app = express();

sequelize.sync();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout extractMetas', true);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dashboard', DashboardRouter);
app.use('/batch', BatchRouter);
app.use('/recipe', RecipeRouter);
app.use('/api', APIRouter);
app.use('/report', reportRouter);

// 404 에러 처리 미들웨어
app.use(function (req, res, next) {
    next(createError(404)); // 404 에러 발생
});

// 에러 핸들러
app.use(function (err, req, res, next) {
    // 에러 상태 및 메시지를 설정
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // 404 에러 처리 및 렌더링
    res.status(err.status || 500);
    res.render('error', {
        errorNumber: err.status || 500, // 에러 상태 코드
        errorTitle: err.status === 404 ? 'Page Not Found' : 'Error', // 에러 제목
        errorMessage: err.status === 404 ? 'The page you are looking for does not exist.' : 'An unexpected error occurred.', // 에러 메시지
        showMenu: false, // 사이드바 숨기기
        showHeaderFooter: false // 헤더와 푸터 숨기기
    });
});

module.exports = app;
