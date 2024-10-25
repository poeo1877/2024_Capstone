// 버튼의 상태를 저장하는 변수 (true: 재생 중, false: 일시정지 상태)
let isPlaying = false;

// 재생 및 일시정지 버튼 토글 함수
function togglePlayPause() {
    const pauseButton = document.getElementById('pauseButton');
    const pauseIcon = document.getElementById('pauseIcon');

    if (isPlaying) {
        // 재생 중이면 일시정지로 전환 (아이콘 변경)
        pauseIcon.classList.remove('fa-play');
        pauseIcon.classList.add('fa-pause');
        isPlaying = false;
        fetch('/api/sensor/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                alert('센서가 다시 실행되었습니다.');
            }
        });
    } else {
        // 일시정지 중이면 재생으로 전환 (아이콘 변경)
        pauseIcon.classList.remove('fa-pause');
        pauseIcon.classList.add('fa-play');
        isPlaying = true;
        // 정지 상태를 서버에 전송
        fetch('/api/sensor/pause', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => {
            if (response.ok) {
                alert('센서가 일시정지되었습니다.');
            }
        });
    }
}

// 정지 버튼 동작
function stop() {
    const pauseIcon = document.getElementById('pauseIcon');

    // 재생 또는 일시정지 상태에 상관없이 정지 시 일시정지 상태로 초기화 (아이콘 초기화)
    pauseIcon.classList.remove('fa-play');
    pauseIcon.classList.add('fa-pause');

    fetch('/api/sensor/stop', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    }).then((response) => {
        if (response.ok) {
            alert('센서가 정지되었습니다.');
            location.reload();
        }
    });
}
