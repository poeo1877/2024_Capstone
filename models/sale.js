module.exports = (sequelize, DataTypes) => {
    const Sale = sequelize.define(
        'Sale',
        {
            sale_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            quantity_sold: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: { min: 1 },
            },
        },
        {
            tableName: 'sale',
            timestamps: false,
        },
    );

    Sale.associate = (models) => {
        Sale.hasMany(models.SalesDetail, { foreignKey: 'sale_id' });
    };

    return Sale;
};
