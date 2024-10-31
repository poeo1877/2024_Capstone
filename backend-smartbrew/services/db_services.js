const moment = require('moment-timezone');
const db = require('../models');
const ExcelJS = require('exceljs');

function formatTimestamps(data) {
    return data.map((row) => {
        row.measured_time = moment(row.measured_time)
            .tz('Asia/Seoul')
            .format('YYYY-MM-DD HH:mm');
        return row;
    });
}

/**
 * fermenter 테이블의 status 값이 FERMENTING 인 것의 fermenter_id 값을 batch 테이블에서 join해서 가져온 행의 batch_id 값을 반환하는 함수
 * @returns {Promise<Array<number>>} - batch_id 값 배열 반환
 */
// getFermentingBatchId 함수 수정
async function getFermentingBatchId() {
    try {
        const results = await db.sequelize.query(
            `
            SELECT b.batch_id
            FROM fermenter f
            JOIN batch b ON f.fermenter_id = b.fermenter_id
            WHERE f.status = 'FERMENTING'
        `,
            {
                type: db.Sequelize.QueryTypes.SELECT,
            },
        );

        // 결과가 없으면 null 반환
        if (results.length === 0) {
            return null; // batch가 없으면 null 반환
        }

        return results.map((row) => row.batch_id);
    } catch (error) {
        console.error('Error fetching batch IDs by fermenter status:', error);
        throw error;
    }
}
/**
 * batchIds와 선택적 column을 받아 데이터를 반환하는 함수
 * @param {Array<number>} batchIds - 배치 ID 배열
 * @param {string|null} column - 선택적 열 (온도, CO2 등)
 * @returns {Promise<Object|Array>} - 단일 batch_id의 경우 배열, 여러 batch_id의 경우 객체로 그룹화된 데이터 반환
 */

async function getSensorDataByBatchIdDashboard(batchIds, column = null) {
    // 기본적으로 항상 반환할 열
    const baseColumns = ['data_id', 'batch_id', 'measured_time'];
    let selectedColumns = baseColumns;

    // 특정 열을 필터링해서 가져오려는 경우 추가
    if (column) {
        selectedColumns.push(column);
    }

    // 열 선택에 따라 사용할 SQL 구문을 구성
    const columnList = column ? selectedColumns.join(', ') : '*';

    try {
        const query = `SELECT ${columnList} 
                       FROM sensor_measurement 
                       WHERE batch_id IN (:batchIds) 
                       ORDER BY measured_time ASC`;

        const data = await db.sequelize.query(query, {
            replacements: { batchIds },
            type: db.sequelize.QueryTypes.SELECT,
        });

        // measured_time 필드를 포맷
        return formatTimestamps(data);
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching sensor measurements');
    }
}

async function getSensorDataByBatchIds(batchIds, column = null) {
    // 기본적으로 항상 반환할 열
    const baseColumns = [
        'data_id',
        'batch_id',
        'measured_time',
        'relative_time',
    ];
    let selectedColumns = baseColumns;

    // 특정 열을 필터링해서 가져오려는 경우 추가
    if (column) {
        selectedColumns.push(column);
    }

    // 열 선택에 따라 사용할 SQL 구문을 구성
    const columnList = column ? selectedColumns.join(', ') : '*';

    try {
        const query = `SELECT ${columnList} 
                       FROM sensor_measurement 
                       WHERE batch_id IN (:batchIds) 
                       ORDER BY measured_time ASC`;

        const data = await db.sequelize.query(query, {
            replacements: { batchIds },
            type: db.sequelize.QueryTypes.SELECT,
        });

        // 데이터를 batch_id 기준으로 그룹화
        const groupedData = formatTimestamps(data).reduce((acc, item) => {
            if (!acc[item.batch_id]) {
                acc[item.batch_id] = [];
            }
            acc[item.batch_id].push(item);
            return acc;
        }, {});

        // JSON 형태로 변환
        const result = Object.keys(groupedData).map((batchId) => ({
            batch_id: batchId,
            measurements: groupedData[batchId],
        }));
        return result;
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching sensor measurements');
    }
}

// 데이터베이스에서 batchId에 해당하는 최신 센서 데이터를 가져오는 함수
async function getLatestSensorDataByBatchId(batchId) {
    try {
        const query = `
            SELECT 
                co2_concentration,
                in_temperature,
                ph
            FROM sensor_measurement
            WHERE batch_id = :batchId
            ORDER BY measured_time DESC
            LIMIT 2
        `;
        const data = await db.sequelize.query(query, {
            replacements: { batchId },
            type: db.Sequelize.QueryTypes.SELECT,
        });

        return data || []; // 최신 데이터가 없을 경우 빈 배열 반환
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching latest sensor data');
    }
}
// 데이터베이스에서 batchId에 해당하는 최신 센서 데이터를 가져오는 함수
async function getLatestSensorDashboardByBatchId(batchId) {
    try {
        const query = `
            SELECT 
                co2_concentration,
                in_temperature,
                pressure_upper,
                measured_time
            FROM sensor_measurement
            WHERE batch_id = :batchId
            ORDER BY measured_time DESC
            LIMIT 2
        `;
        const data = await db.sequelize.query(query, {
            replacements: { batchId },
            type: db.Sequelize.QueryTypes.SELECT,
        });

        return data || []; // 최신 데이터가 없을 경우 빈 배열 반환
    } catch (err) {
        console.error(err);
        throw new Error('Error fetching latest sensor data');
    }
}

async function createExcelFileForBatchIds(batchIds) {
    try {
        const workbook = new ExcelJS.Workbook();

        for (const batchId of batchIds) {
            const query = `
                SELECT 
                    measured_time,
                    in_temperature,
                    co2_concentration,
                    ph
                FROM sensor_measurement
                WHERE batch_id = :batchId
                ORDER BY measured_time ASC
            `;
            const data = await db.sequelize.query(query, {
                replacements: { batchId },
                type: db.Sequelize.QueryTypes.SELECT,
            });

            const worksheet = workbook.addWorksheet(`Batch ${batchId}`);

            // Add header row
            worksheet.columns = [
                { header: '측정시간', key: 'measured_time', width: 20 },
                { header: '온도', key: 'in_temperature', width: 15 },
                { header: '이산화탄소', key: 'co2_concentration', width: 15 },
                { header: 'PH', key: 'ph', width: 15 },
            ];

            // Add data rows
            data.forEach((row) => {
                worksheet.addRow({
                    measured_time: row.measured_time || 'N/A',
                    in_temperature:
                        row.in_temperature !== null
                            ? parseFloat(row.in_temperature)
                            : '',
                    co2_concentration:
                        row.co2_concentration !== null
                            ? parseInt(row.co2_concentration, 10)
                            : '',
                    ph: row.ph !== null ? parseFloat(row.ph) : '',
                });
            });
        }

        // Return the Excel file as a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (err) {
        console.error(err);
        throw new Error('Error creating Excel file');
    }
}

module.exports = {
    getSensorDataByBatchIds,
    getLatestSensorDataByBatchId,
    createExcelFileForBatchIds,
    getFermentingBatchId,
    getSensorDataByBatchIdDashboard,
    getLatestSensorDashboardByBatchId,
};
