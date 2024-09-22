module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define(
        'Product',
        {
            product_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            product_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            price: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
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
            expiration_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            bottling_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            notification_number: {
                type: DataTypes.STRING(30),
                allowNull: true,
            },
            barcode: {
                type: DataTypes.STRING(30),
                allowNull: true,
            },
        },
        {
            tableName: 'product',
            timestamps: false,
        },
    );

    Product.associate = (models) => {
        Product.belongsTo(models.Lot, { foreignKey: 'lot_id' });
        Product.hasMany(models.SalesDetail, { foreignKey: 'product_id' });
    };

    return Product;
};
