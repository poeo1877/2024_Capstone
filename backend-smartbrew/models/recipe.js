module.exports = (sequelize, DataTypes) => {
    const Recipe = sequelize.define(
        'Recipe',
        {
            recipe_id: {
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
            recipe_detail: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            recipe_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            product_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
        },
        {
            tableName: 'recipe',
            timestamps: false,
        },
    );

    Recipe.associate = (models) => {
        Recipe.hasMany(models.Batch, { foreignKey: 'recipe_id' });
    };

    return Recipe;
};
