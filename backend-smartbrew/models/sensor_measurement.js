module.exports = (sequelize, DataTypes) => {
    const SensorMeasurement = sequelize.define(
        'SensorMeasurement',
        {
            data_id: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            co2_concentration: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            brix: {
                type: DataTypes.DECIMAL(5, 3),
                allowNull: true,
            },
            measured_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            out_temperature: {
                type: DataTypes.DECIMAL(5, 3),
                allowNull: true,
            },
            in_temperature: {
                type: DataTypes.DECIMAL(5, 3),
                allowNull: true,
            },
            ph: {
                type: DataTypes.DECIMAL(4, 2),
                allowNull: true,
            },
            pressure_upper: {
                type: DataTypes.DECIMAL(10, 4),
                allowNull: true,
            },
            // humidity: {
            // 	type: DataTypes.INTEGER,
            // 	allowNull: true,
            // },
            batch_id: {
                type: DataTypes.INTEGER,
                references: { model: 'Batch', key: 'batch_id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            relative_time: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            tableName: 'sensor_measurement',
            timestamps: false,
        },
    );

    SensorMeasurement.associate = (models) => {
        SensorMeasurement.belongsTo(models.Batch, { foreignKey: 'batch_id' });
    };

    return SensorMeasurement;
};
