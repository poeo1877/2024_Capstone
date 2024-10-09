module.exports = (sequelize, DataTypes) => {
    const DashboardLimit = sequelize.define(
        'DashboardLimit',
        {
            limit_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            batch_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Batch', key: 'batch_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            sensor_type: { type: DataTypes.TEXT, allowNull: true },
            startdate: { type: DataTypes.DATE, allowNull: true },
            enddate: { type: DataTypes.DATE, allowNull: true },
            upper_limit: { type: DataTypes.INTEGER, allowNull: true },
            lower_limit: { type: DataTypes.INTEGER, allowNull: true },
        },
        {
            tableName: 'dashboard_limit',
            timestamps: false,
        },
    );

    DashboardLimit.associate = (models) => {
        DashboardLimit.belongsTo(models.Batch, { foreignKey: 'batch_id' });
    };

    return DashboardLimit;
};
