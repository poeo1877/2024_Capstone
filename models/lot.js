module.exports = (sequelize, DataTypes) => {
    const Lot = sequelize.define(
        'Lot',
        {
            lot_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            product_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            lot_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: { min: 1 },
            },
            batch_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Batch', key: 'batch_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
        },
        {
            tableName: 'lot',
            timestamps: false,
        },
    );

    Lot.associate = (models) => {
        Lot.belongsTo(models.Batch, { foreignKey: 'batch_id' });
        Lot.hasMany(models.Product, { foreignKey: 'lot_id' });
        Lot.hasMany(models.LotHistory, { foreignKey: 'lot_id' });
    };

    return Lot;
};
