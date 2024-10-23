module.exports = (sequelize, DataTypes) => {
    const LotHistory = sequelize.define(
        'LotHistory',
        {
            lot_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Lot', key: 'lot_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            lot_location: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
        },
        {
            tableName: 'lot_history',
            timestamps: false,
        },
    );

    LotHistory.associate = (models) => {
        LotHistory.belongsTo(models.Lot, { foreignKey: 'lot_id' });
    };

    return LotHistory;
};
