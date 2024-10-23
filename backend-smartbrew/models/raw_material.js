module.exports = (sequelize, DataTypes) => {
    const RawMaterial = sequelize.define(
        'RawMaterial',
        {
            raw_material_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            raw_material_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            category: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            unit: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            supplier_name: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            phone_number: {
                type: DataTypes.STRING(15),
                allowNull: true,
            },
            zip_code: {
                type: DataTypes.STRING(6),
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            tableName: 'raw_material',
            timestamps: false,
        },
    );

    RawMaterial.associate = function(models) {
        RawMaterial.hasMany(models.RawMaterialReceipt, { foreignKey: 'raw_material_id', sourceKey: 'raw_material_id' });
        RawMaterial.hasMany(models.RawMaterialUsage, { foreignKey: 'raw_material_id', sourceKey: 'raw_material_id' });
    };

    return RawMaterial;
};
