document.addEventListener('DOMContentLoaded', function () {
    var ctxTemperatureChart = document
        .getElementById('temperatureChart')
        .getContext('2d');
    var ctxCo2Chart = document.getElementById('co2Chart').getContext('2d');
    var ctxPressureChart = document
        .getElementById('pressureChart')
        .getContext('2d');

    var baseURL = window.location.origin;
    var co2DataLoaded = false;
    var pressureDataLoaded = false;

    var co2Data = [];
    var pressureData = [];

    var temperatureAnnotations = [];
    var co2Annotations = [];
    var pressureAnnotations = [];

    // 랜덤 색상 생성 함수
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    // 각 batchId에 대한 데이터셋을 생성
    function createDatasets(data, key) {
        return data.map((batch) => {
            return {
                label: `Batch ${batch.batch_id}`,
                data: batch.measurements.map((entry) => ({
                    // x: entry.relative_time, // 상대 시간을 x축에 표시
                    x: new Date(entry.relative_time * 1000), // Convert seconds to milliseconds
                    y: entry[key],
                    absoluteTime: entry.measured_time, // 절대 시간
                })),
                borderColor: getRandomColor(),
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
            };
        });
    }

    // 상대적인 시간 배열 생성 함수
    function generateRelativeTimes(length) {
        var times = [];
        for (var i = 0; i < length; i++) {
            times.push(i); // 상대적인 시간 (분 단위)
        }
        return times;
    }

    // 차트 생성 함수
    function createChart(ctx, datasets) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                // aspectRatio: 2,
                scales: {
                    x: {
                        type: 'timeseries', // x축을 time으로 설정
                        time: {
                            unit: 'day', // Default unit
                            displayFormats: {
                                day: 'D [일]',
                                hour: 'HH:mm', // 시간:분 형식
                                minute: 'HH:mm', // 시간:분 형식
                            },
                            tooltipFormat: 'D [일] HH:mm', // 툴팁 형식: 일 시간:분:초
                        },
                        title: {
                            callback: function (value, index, ticks) {
                                const scale = this.chart.scales.x;
                                const range = scale.max - scale.min; // 범위(밀리초 단위)

                                const duration = dayjs.duration(value); // 값은 밀리초 단위

                                if (range >= 2 * 24 * 60 * 60 * 1000) {
                                    // 2일 이상
                                    return duration.format('D [일]');
                                } else if (range >= 2 * 60 * 60 * 1000) {
                                    // 2시간 이상
                                    return duration.format('H [시간]');
                                } else if (range >= 2 * 60 * 1000) {
                                    // 2분 이상
                                    return duration.format('m [분]');
                                } else {
                                    return duration.format('s [초]');
                                }
                            },
                            display: true,
                            text: '발효 기간', // x축 라벨을 경과 시간으로 표시
                        },
                        ticks: {
                            autoSkip: true, // 레이블이 자동으로 스킵되도록 설정
                            maxRotation: 0, // 레이블이 수평으로 표시되도록 설정
                            minRotation: 0, // 회전하지 않음
                            maxTicksLimit: 10, // 적절한 간격으로 x축 레이블을 자동으로 생략
                        },
                        grid: {
                            display: true,
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const sensorData = context.parsed.y;
                                const absoluteTime = context.raw.absoluteTime;
                                return `값: ${sensorData}, 측정 시점: ${absoluteTime}`;
                            },
                        },
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy',
                            threshold: 10, // 팬이 발생하기 위한 최소 움직임
                            modifierKey: 'ctrl', // Ctrl 키를 누른 상태에서만 팬 가능  
                        },
                        zoom: {
                            wheel: {
                                enabled: true, // 휠 줌만 활성화
                            },
                            pinch: {
                                enabled: false, // 터치 줌 비활성화
                            },
                            mode: 'xy',
                            drag: {
                                enabled: true, // 드래그 줌 비활성화
                            },
                        },
                    },
                },
            },
        });
    }

    // 온도 차트 생성
    var temperatureDatasets = createDatasets(temperatureData, 'in_temperature');
    var temperatureChart = createChart(
        ctxTemperatureChart,
        temperatureDatasets,
    );

    // CO2 차트 생성
    var co2Datasets = createDatasets(co2Data, 'co2_concentration');
    var co2Chart = createChart(ctxCo2Chart, co2Datasets);

    // 압력 차트 생성
    var pressureDatasets = createDatasets(pressureData, 'pressure_upper');
    var pressureChart = createChart(ctxPressureChart, pressureDatasets);

    // 더블클릭 이벤트 핸들러 추가
    function addDoubleClickZoomOut(chart, chartElementId) {
        document
            .getElementById(chartElementId)
            .addEventListener('dblclick', function () {
                chart.zoom(0.5); // 차트를 원래 크기로 축소
            });
    }

    addDoubleClickZoomOut(temperatureChart, 'temperatureChart');
    addDoubleClickZoomOut(co2Chart, 'co2Chart');
    addDoubleClickZoomOut(pressureChart, 'pressureChart');

    document
        .getElementById('temperature-btn')
        .addEventListener('click', function () {
            document.getElementById('temperatureChart').style.display = 'block';
            document.getElementById('co2Chart').style.display = 'none';
            document.getElementById('pressureChart').style.display = 'none';
            temperatureChart.resetZoom();
            temperatureChart.update();
        });

    document.getElementById('co2-btn').addEventListener('click', function () {
        if (!co2DataLoaded) {
            var batchIdsQuery = batchIds.join(',');
            fetch(`${baseURL}/api/sensor/co2?batchId=${batchIdsQuery}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    co2DataLoaded = true;
                    co2Datasets = createDatasets(data, 'co2_concentration');
                    co2Chart.data.datasets = co2Datasets;
                    co2Chart.update();
                })
                .catch((error) =>
                    console.error('Error fetching CO2 data:', error),
                );
        } else {
            co2Chart.update();
        }
        document.getElementById('temperatureChart').style.display = 'none';
        document.getElementById('co2Chart').style.display = 'block';
        document.getElementById('pressureChart').style.display = 'none';
    });

    document
        .getElementById('pressure-btn')
        .addEventListener('click', function () {
            if (!pressureDataLoaded) {
                var batchIdsQuery = batchIds.join(',');
                fetch(`${baseURL}/api/sensor/pressure?batchId=${batchIdsQuery}`)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then((data) => {
                        pressureDataLoaded = true;
                        pressureDatasets = createDatasets(
                            data,
                            'pressure_upper',
                        );
                        pressureChart.data.datasets = pressureDatasets;
                        pressureChart.update();
                    })
                    .catch((error) =>
                        console.error('Error fetching pressure data:', error),
                    );
            } else {
                pressureChart.update();
            }
            document.getElementById('temperatureChart').style.display = 'none';
            document.getElementById('co2Chart').style.display = 'none';
            document.getElementById('pressureChart').style.display = 'block';
        });
});
