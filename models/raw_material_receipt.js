module.exports = (sequelize, DataTypes) => {
    const RawMaterialReceipt = sequelize.define(
        'RawMaterialReceipt',
        {
            receipt_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            quantity: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            unit_price: {
                type: DataTypes.INTEGER,
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
        },
        {
            tableName: 'raw_material_receipt',
            timestamps: false,
        },
    );

    RawMaterialReceipt.associate = function(models) {
        RawMaterialReceipt.belongsTo(models.RawMaterial, { foreignKey: 'raw_material_id', targetKey: 'raw_material_id' });
    };

    return RawMaterialReceipt;
};
