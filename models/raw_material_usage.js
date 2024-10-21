module.exports = (sequelize, DataTypes) => {
    const RawMaterialUsage = sequelize.define(
        'RawMaterialUsage',
        {
            usage_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            quantity_used: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            raw_material_id: {
                type: DataTypes.INTEGER,
                references: { model: 'RawMaterials', key: 'raw_material_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            batch_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Batch', key: 'batch_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'raw_material_usage',
            timestamps: false,
        },
    );

    RawMaterialUsage.associate = (models) => {
        RawMaterialUsage.belongsTo(models.RawMaterial, { foreignKey: 'raw_material_id', targetKey: 'raw_material_id' });
        RawMaterialUsage.belongsTo(models.Batch, { foreignKey: 'batch_id' });
    };

    return RawMaterialUsage;
};
