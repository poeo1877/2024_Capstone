var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
require('dotenv').config();

var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var DashboardRouter = require('./routes/dashboard');
var BatchRouter = require('./routes/batch');
var RecipeRouter = require('./routes/recipe');
const { router: APIRouter } = require('./routes/api'); // APIRouter와 setIo를 가져옴
var authRouter = require('./routes/auth'); // 로그인/로그아웃 라우터 추가
var FermenterRouter = require('./routes/fermenter');
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(
	session({
		secret: 'your_secret_key', // 반드시 보안 키로 변경
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false }, // HTTPS 환경에서는 true로 설정
	})
);

// 로그인 관련 라우터 추가 (인증이 필요 없는 라우터)
app.use('/', authRouter);
app.use('/api', APIRouter);

app.get('/', (req, res) => {
	res.redirect('/dashboard');
});

// 사용자 인증 미들웨어
function isAuthenticated(req, res, next) {
	// 에러 페이지와 로그인, 회원가입 페이지 접근 시 인증 제외
	if (req.path.startsWith('/error') || req.path === '/login' || req.path === '/register') {
		return next();
	}

	// 로그인 상태를 템플릿에 전달
	res.locals.isAuthenticated = !!req.session.user;

	if (req.session.user) {
		return next(); // 로그인된 경우 다음으로 진행
	}

	res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 이동
}

// 모든 라우트에 대해 인증 미들웨어 적용
app.use('/', indexRouter);
//app.use(isAuthenticated);
app.use('/dashboard', DashboardRouter);
app.use('/batch', BatchRouter);
app.use('/recipe', RecipeRouter);
app.use('/report', reportRouter);
app.use('/users', usersRouter);
app.use('/fermenter', FermenterRouter);

// 404 에러 처리 미들웨어
app.use(function (req, res, next) {
	const err = createError(404);
	res.status(err.status || 500);
	res.render('error', {
		errorNumber: 404,
		errorTitle: 'Page Not Found',
		errorMessage: 'The page you are looking for does not exist.',
		showMenu: false,
		showHeaderFooter: false,
	});
});

// 에러 핸들러
app.use(function (err, req, res, next) {
	// 에러 상태 및 메시지를 설정
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// 렌더링
	res.status(err.status || 500);
	res.render('error', {
		errorNumber: err.status || 500,
		errorTitle: err.status === 404 ? 'Page Not Found' : 'Error',
		errorMessage: err.status === 404 ? 'The page you are looking for does not exist.' : 'An unexpected error occurred.',
		showMenu: false,
		showHeaderFooter: false,
	});
});

// FastAPI 서버가 잘 연결되었는지 확인하는 코드입니다.
// const axios = require('axios');
// const { analyzeBatch } = require('./services/fastapi_service');

// console.log('Analyzing batch 3...');
// analyzeBatch(3);
module.exports = app;
