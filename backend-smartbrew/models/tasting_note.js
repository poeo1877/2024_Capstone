module.exports = (sequelize, DataTypes) => {
    const TastingNote = sequelize.define(
        'TastingNote',
        {
            tasting_note_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            fermentation_aroma: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            foam: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            mouthfeel: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            balance: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            clarity: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            sweetness: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            acidity: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            body: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            grainy_aroma: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: false,
            },
            finish: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: true,
            },
            evaluator_name: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            batch_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Batch', key: 'batch_id' },
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
        },
        {
            tableName: 'tasting_note',
            timestamps: false,
        },
    );

    TastingNote.associate = (models) => {
        TastingNote.belongsTo(models.Batch, { foreignKey: 'batch_id' });
    };

    return TastingNote;
};
