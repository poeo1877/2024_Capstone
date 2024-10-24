// 특정 batchId에 해당하는 데이터를 가져오는 함수
function fetchLimits(batchIds) {
    fetch(`/dashboard/all-limit?batchId=${batchIds}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
                return;
            }

            populateTable(data);
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

// 테이블에 데이터를 채워넣는 함수
function populateTable(limits) {
    const tableBody = document.getElementById('notificationTableBody');
    tableBody.innerHTML = ''; // 기존 데이터를 비움

    limits.forEach((limit, index) => {
        const row = document.createElement('tr');

        // 번호
        const numberCell = document.createElement('td');
        numberCell.textContent = index + 1;
        row.appendChild(numberCell);

        // 시작시간
        const startTimeCell = document.createElement('td');
        startTimeCell.textContent = new Date(limit.startdate).toLocaleString();
        row.appendChild(startTimeCell);

        // 종료시간
        const endTimeCell = document.createElement('td');
        endTimeCell.textContent = new Date(limit.enddate).toLocaleString();
        row.appendChild(endTimeCell);

        // 센서 종류
        const sensorTypeCell = document.createElement('td');
        sensorTypeCell.textContent = limit.sensor_type;
        row.appendChild(sensorTypeCell);

        // 상한값
        const upperLimitCell = document.createElement('td');
        upperLimitCell.textContent = limit.upper_limit;
        row.appendChild(upperLimitCell);

        // 하한값
        const lowerLimitCell = document.createElement('td');
        lowerLimitCell.textContent = limit.lower_limit;
        row.appendChild(lowerLimitCell);

        // 삭제 버튼
        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '-';
        deleteButton.classList.add('btn', 'btn-outline-secondary', 'btn-sm');
        deleteButton.style.width = '30px'; // 버튼 크기 조절
        deleteButton.style.height = '30px'; // 버튼 높이 조절
        deleteButton.style.padding = '0'; // 패딩 최소화
        deleteButton.style.textAlign = 'center'; // 가운데 정렬
        deleteButton.onclick = () => deleteLimit(limit.limit_id);
        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        tableBody.appendChild(row);
    });
}

// 삭제 기능 함수
function deleteLimit(limitId) {
    if (confirm('정말로 삭제하시겠습니까?')) {
        fetch(`/dashboard/delete-limit/${limitId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    alert('삭제되었습니다.');
                    fetchLimits(batchIds);
                    location.reload();
                } else {
                    alert('삭제 실패.');
                }
            })
            .catch((error) => {
                console.error('Error deleting limit:', error);
            });
    }
}

// 페이지가 로드되면 batchId 5에 해당하는 데이터를 가져옴
document.addEventListener('DOMContentLoaded', () => {
    fetchLimits(batchIds); // batchId 5번을 예시로 사용
});
