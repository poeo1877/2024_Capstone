document.getElementById('addRowButton').addEventListener('click', async function() {
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    const cellCount = document.getElementById('data-table').rows[0].cells.length;

    // 열 번호를 현재 행의 수로 설정
    const cellIndex = newRow.insertCell(0);
    cellIndex.textContent = table.rows.length;

    // 현재 날짜와 시간 가져오기
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0];

    // 날짜와 시간을 테이블에 추가
    const cellDate = newRow.insertCell(1);
    cellDate.textContent = date;
    const cellTime = newRow.insertCell(2);
    cellTime.textContent = time;

    // 'Brand' 열 추가 (NULL 값)
    const cellBrand = newRow.insertCell(3);
    cellBrand.textContent = 'NULL';

    // 배치 ID 생성 및 추가. 형식: 현재날짜-열번호-A
    const batchId = `${date}-${String(table.rows.length).padStart(2, '0')}-A`;
    const cellBatchId = newRow.insertCell(4);
    cellBatchId.textContent = batchId;

    // 백엔드에서 최신 온도 데이터를 가져오기
    try {
        const response = await fetch('/sensorMeasurements/latest-temperatures');
        const data = await response.json();
        // 내부 온도와 외부 온도를 테이블에 추가
        const cellInternalTemp = newRow.insertCell(5);
        cellInternalTemp.textContent = data.inTemperature ;
        const cellExternalTemp = newRow.insertCell(6);
        cellExternalTemp.textContent = data.outTemperature ;
    } catch (error) {
        console.error('Error fetching temperature data:', error);
        const cellInternalTemp = newRow.insertCell(5);
        cellInternalTemp.textContent = 'NULL';
        const cellExternalTemp = newRow.insertCell(6);
        cellExternalTemp.textContent = 'NULL';
    }

    // 나머지 열에 'NULL' 채우기
    for (let i = 7; i < cellCount; i++) {
        const cell = newRow.insertCell(i);
        cell.textContent = 'NULL';
    }
});
