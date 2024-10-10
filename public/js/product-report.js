// 엑셀 다운로드 버튼 이벤트 핸들러
document
    .getElementById('excelButton')
    .addEventListener('click', async function () {
        var baseURL = window.location.origin;

        const selectedBatchIds = Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked'),
        ).map((checkbox) => checkbox.id);

        if (selectedBatchIds.length === 0) {
            alert('Please select at least one batch.');
            return;
        }

        const workbook = XLSX.utils.book_new(); // 새 엑셀 파일 생성

        for (const batchId of selectedBatchIds) {
            const response = await fetch(
                `${baseURL}/api/sensor/excel?batchId=${batchId}`,
            );
            const data = await response.json();

            // 데이터를 엑셀 시트 형식으로 변환 (날짜와 시간을 나누어 처리)
            const worksheet = XLSX.utils.json_to_sheet(
                data.map((item) => {
                    const dateObj = new Date(item.measured_time); // Date 객체로 변환
                    const date = dateObj.toLocaleDateString(); // 날짜만 추출
                    const time = dateObj.toLocaleTimeString(); // 시간만 추출

                    return {
                        날짜: date, // 날짜 열
                        시간: time, // 시간 열
                        온도: item.in_temperature, // 내부 온도 열
                    };
                }),
            );

            // 각 Batch ID를 시트 이름으로 지정
            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                `Batch_${batchId}`,
            );
        }

        XLSX.writeFile(workbook, 'Production_report.xlsx'); // 엑셀 파일 다운로드
    });
