module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            hashedPassword: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            chatId: {
                type: DataTypes.STRING, // chatId는 문자열이므로 STRING 타입 사용
                allowNull: true, // 초기에는 null 허용 (사용자가 봇과 상호작용할 때 저장)
                unique: true, // 각 사용자마다 고유한 chatId를 저장하므로 unique 설정
            },
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'user',
            timestamps: true,
        },
    );

    return User;
};
