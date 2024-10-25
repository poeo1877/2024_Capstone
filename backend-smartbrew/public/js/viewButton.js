// View 버튼 클릭 시 선택된 batch_id들을 모아서 /archive로 이동하는 함수
document.getElementById('viewButton').addEventListener('click', function () {
    var baseURL = window.location.origin;
    // 선택된 체크박스들의 batch_id를 수집
    const selectedBatchIds = Array.from(
        document.querySelectorAll('input[type="checkbox"]:checked'),
    ).map((checkbox) => checkbox.id);

    // 선택된 batch_id가 없는 경우 경고창을 띄우고 중단
    if (selectedBatchIds.length === 0) {
        alert('Please select at least one batch.');
        return;
    }

    // 선택된 batch_id를 쿼리스트링으로 변환
    const queryString = selectedBatchIds.map((id) => `${id}`).join(',');

    // /archive 경로로 이동 (쿼리스트링 전달)
    window.location.href = `${baseURL}/batch/archive?batchIds=${queryString}`;
});
