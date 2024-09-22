module.exports = (sequelize, DataTypes) => {
    const Fermenter = sequelize.define(
        'Fermenter',
        {
            fermenter_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            fermenter_volume: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: { min: 1 },
            },
            status: {
                type: DataTypes.ENUM(
                    'WAITING',
                    'FERMENTING',
                    'COMPLETED',
                    'ERROR',
                ),
                defaultValue: 'WAITING',
                allowNull: false,
            },
            fermenter_line: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
        },
        {
            tableName: 'fermenter',
            timestamps: false,
        },
    );

    Fermenter.associate = (models) => {
        Fermenter.hasMany(models.Batch, { foreignKey: 'fermenter_id' });
    };

    return Fermenter;
};
