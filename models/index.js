const path = require('path');
const Sequelize = require('sequelize');

// 개발 모드 환경 설정
const env = process.env.NODE_ENV || 'development';

// DB 연결 환경 설정 정보
const config = require(path.join(__dirname, '..', 'config', 'config.js'))[
    env
];

// 데이터베이스 객체
const db = {};

// DB 연결 정보로 시퀄라이즈 ORM 객체 생성
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
);

// 시퀄라이즈 객체를 DB 객체에 매핑
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델 파일 참조 및 DB 속성 정의하기
db.Batch = require('./batch')(sequelize, Sequelize.DataTypes);
db.Recipe = require('./recipe')(sequelize, Sequelize.DataTypes);
db.Fermenter = require('./fermenter')(sequelize, Sequelize.DataTypes);
db.SensorMeasurement = require('./sensor_measurement')(
    sequelize,
    Sequelize.DataTypes,
);
db.TastingNote = require('./tasting_note')(sequelize, Sequelize.DataTypes);
db.Lot = require('./lot')(sequelize, Sequelize.DataTypes);
db.RawMaterialUsage = require('./raw_material_usage')(
    sequelize,
    Sequelize.DataTypes,
);
db.Product = require('./product')(sequelize, Sequelize.DataTypes);
db.LotHistory = require('./lot_history')(sequelize, Sequelize.DataTypes);
db.Sale = require('./sale')(sequelize, Sequelize.DataTypes);
db.SalesDetail = require('./sale_detail')(sequelize, Sequelize.DataTypes);
db.RawMaterialReceipt = require('./raw_material_receipt')(
    sequelize,
    Sequelize.DataTypes,
);
db.RawMaterial = require('./raw_material')(sequelize, Sequelize.DataTypes);

// 모델 간 관계 설정 (associate 메서드를 각 모델에서 정의한 경우 실행)
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// DB 객체 외부로 노출
module.exports = db;
