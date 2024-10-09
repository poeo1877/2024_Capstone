var createError = require('http-errors');
var express = require('express');
var path = require('path');
const http = require('http'); // http 모듈 추가
const initSocket = require('./socket'); // Socket.io 초기화 모듈 가져오기
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const moment = require('moment-timezone');

require('dotenv').config();

var expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var DashboardRouter = require('./routes/dashboard');
var BatchRouter = require('./routes/batch');
var RecipeRouter = require('./routes/recipe');
var APIRouter = require('./routes/api');
var authRouter = require('./routes/auth'); // 로그인/로그아웃 라우터 추가
var FermenterRouter = require('./routes/fermenter');
var reportRouter = require('./routes/report');

var sequelize = require('./models/index.js').sequelize;
const { Op } = require('sequelize');
var app = express();
const server = http.createServer(app);
const port = 3001;

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
app.use(isAuthenticated);
app.use('/', indexRouter);
app.use('/dashboard', DashboardRouter);
app.use('/batch', BatchRouter);
app.use('/recipe', RecipeRouter);
app.use('/api', APIRouter);
app.use('/report', reportRouter);
app.use('/users', usersRouter);
app.use('/fermenter', FermenterRouter);

const { io } = initSocket(server);

const socket = require('socket.io')(server);

// 1분마다 테스트 데이터 삽입 함수 (임시로 예시 데이터 사용)
const insertTestSensorData = async (models) => {
    try {
        // 랜덤 데이터 생성 (예시)
        const sensorData = {
            co2_concentration: Math.floor(Math.random() * (10000 - 0 + 1)), // 0-1000 사이의 난수
            brix: (Math.random() * (20 - 0) + 0).toFixed(3), // 0-20 사이의 소수점 3자리
            measured_time: new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
            out_temperature: (Math.random() * (35 - 25) + 25).toFixed(3), // 0-100 사이의 소수점 3자리
            in_temperature: (Math.random() * (35 - 25) + 25).toFixed(3), // 0-100 사이의 소수점 3자리
            ph: (Math.random() * (14 - 0) + 0).toFixed(2), // 0-14 사이의 소수점 2자리
            pressure_upper: (Math.random() * (1100 - 900) + 900).toFixed(4), // 0-50 사이의 소수점 4자리
            pressure_lower: (Math.random() * (1100 - 900) + 900).toFixed(4), // 0-50 사이의 소수점 4자리
            batch_id: 6, // 예시이므로 null로 설정
        };

        const newMeasurement = await models.SensorMeasurement.create(
            sensorData,
        );
        await checkAlert(newMeasurement, models, socket);
        // 데이터가 추가되면 경계값 체크 (checkAlert 함수 추가 필요)
        // await checkAlert(newMeasurement, models, sendAlert);

        console.log('New sensor data added:', sensorData);
    } catch (error) {
        console.error('Error adding sensor data:', error);
    }
};
const checkAlert = async (measurement, models, socket) => {
    try {
        const currentTime = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
        console.log(currentTime);
        // 각각의 센서 타입에 대해 경계값 조회
        const temperatureLimits = await models.DashboardLimit.findAll({
            where: {
                sensor_type: 'temperature',
                enddate: {
                    [Op.gt]: currentTime, // enddate가 현재보다 큰 것만 조회
                },
            },
            order: [['limit_id', 'DESC']],
        });

        const co2Limits = await models.DashboardLimit.findAll({
            where: {
                sensor_type: 'co2',
                enddate: {
                    [Op.gt]: currentTime,
                },
            },
            order: [['limit_id', 'DESC']],
        });

        const pressureLimits = await models.DashboardLimit.findAll({
            where: {
                sensor_type: 'pressure',
                enddate: {
                    [Op.gt]: currentTime,
                },
            },
            order: [['limit_id', 'DESC']],
        });

        let alerts = [];

        // 온도 경계값 체크
        if (temperatureLimits.length > 0) {
            const limit = temperatureLimits[0];
            if (measurement.in_temperature > limit.upper_limit) {
                alerts.push('온도가 상한값을 초과했습니다!');
            } else if (measurement.in_temperature < limit.lower_limit) {
                alerts.push('온도가 하한값 아래로 내려갔습니다!');
            }
        }

        // CO2 경계값 체크
        if (co2Limits.length > 0) {
            const limit = co2Limits[0];
            if (measurement.co2_concentration > limit.upper_limit) {
                alerts.push('CO2 농도가 상한값을 초과했습니다!');
            } else if (measurement.co2_concentration < limit.lower_limit) {
                alerts.push('CO2 농도가 하한값 아래로 내려갔습니다!');
            }
        }

        // 압력 경계값 체크
        if (pressureLimits.length > 0) {
            const limit = pressureLimits[0];
            if (measurement.pressure_upper > limit.upper_limit) {
                alerts.push('압력이 상한값을 초과했습니다!');
            } else if (measurement.pressure_lower < limit.lower_limit) {
                alerts.push('압력이 하한값 아래로 내려갔습니다!');
            }
        }

        // 모든 알림 메시지가 있다면 클라이언트로 전송
        if (alerts.length > 0) {
            for (const message of alerts) {
                // 데이터베이스에 알림 추가
                await models.Alert.create({
                    alert_message: message,
                    alert_time: currentTime,
                });
            }
            socket.emit('newDataAlert', { messages: alerts });
        } else {
            console.log('모든 센서가 정상 범위에 있습니다.');
        }
    } catch (error) {
        console.error('경계값 체크 중 오류 발생:', error);
    }
};

// 1분마다 테스트 데이터 삽입
// setInterval(() => {
//     insertTestSensorData(sequelize.models);
// }, 60000); // 60000ms = 1분

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

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
