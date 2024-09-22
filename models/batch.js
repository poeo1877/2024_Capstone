module.exports = (sequelize, DataTypes) => {
    const Batch = sequelize.define(
        'Batch',
        {
            batch_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            start_time: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false,
            },
            end_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            recipe_ratio: {
                type: DataTypes.STRING(10),
                defaultValue: '1.0',
                allowNull: true,
            },
            recipe_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Recipe', // This references the Recipe table
                    key: 'recipe_id',
                },
            },
            fermenter_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'Fermenter', // This references the Fermenter table
                    key: 'fermenter_id',
                },
            },
        },
        {
            tableName: 'batch',
            timestamps: false, // You can enable timestamps if you want createdAt/updatedAt
        },
    );

    // Define associations with other models (if needed)
    Batch.associate = (models) => {
        Batch.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
        Batch.belongsTo(models.Fermenter, { foreignKey: 'fermenter_id' });
        Batch.hasMany(models.SensorMeasurement, { foreignKey: 'batch_id' });
        Batch.hasMany(models.TastingNote, { foreignKey: 'batch_id' });
        Batch.hasMany(models.Lot, { foreignKey: 'batch_id' });
        Batch.hasMany(models.RawMaterialUsage, { foreignKey: 'batch_id' });
    };

    return Batch;
};
