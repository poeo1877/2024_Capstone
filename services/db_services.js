const moment = require("moment-timezone");
const { sequelize } = require("../models");

function formatTimestamps(data) {
    return data.map(row => {
        row.measured_time = moment(row.measured_time)
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD HH:mm");
        return row;
    });
}

/**
 * batchIds와 선택적 column을 받아 데이터를 반환하는 함수
 * @param {Array<number>} batchIds - 배치 ID 배열 
 * @param {string|null} column - 선택적 열 (온도, CO2 등)
 * @returns {Promise<Object|Array>} - 단일 batch_id의 경우 배열, 여러 batch_id의 경우 객체로 그룹화된 데이터 반환
 */
async function getSensorDataByBatchIds(batchIds, column = null) {
	// 기본적으로 항상 반환할 열
	const baseColumns = ["data_id", "batch_id", "measured_time"];
	let selectedColumns = baseColumns;

	// 특정 열을 필터링해서 가져오려는 경우 추가
	if (column) {
		selectedColumns.push(column);
	}

	// 열 선택에 따라 사용할 SQL 구문을 구성
	const columnList = column ? selectedColumns.join(", ") : "*";

	try {
		const query = `SELECT ${columnList} 
                       FROM sensor_measurement 
                       WHERE batch_id IN (:batchIds) 
                       ORDER BY measured_time ASC`;

		const data = await sequelize.query(query, {
			replacements: { batchIds },
			type: sequelize.QueryTypes.SELECT,
		});
        
        // measured_time 필드를 포맷
        return formatTimestamps(data);
	} catch (err) {
		console.error(err);
		throw new Error("Error fetching sensor measurements");
	}
}

module.exports = { getSensorDataByBatchIds };
