module.exports = (sequelize, DataTypes) => {
    const SalesDetail = sequelize.define(
        'SalesDetail',
        {
            sale_detail_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            payment_method: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            discount_yn: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
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
            product_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Product', key: 'product_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            sale_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Sale', key: 'sale_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
        },
        {
            tableName: 'sales_detail',
            timestamps: false,
        },
    );

    SalesDetail.associate = (models) => {
        SalesDetail.belongsTo(models.Product, { foreignKey: 'product_id' });
        SalesDetail.belongsTo(models.Sale, { foreignKey: 'sale_id' });
    };

    return SalesDetail;
};
