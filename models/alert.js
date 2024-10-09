// models/alert.js
module.exports = (sequelize, DataTypes) => {
    const Alert = sequelize.define(
        'Alert',
        {
            alert_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            alert_message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            alert_time: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'alert', // 데이터베이스 테이블명
            timestamps: false, // 자동 생성되는 createdAt, updatedAt 필드 비활성화
        },
    );

    return Alert;
};
