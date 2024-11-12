document.addEventListener('DOMContentLoaded', function () {
    var ctxLineChart = document.getElementById('lineChart').getContext('2d');
    var baseURL = window.location.origin;
    var co2DataLoaded = false; // CO2 데이터가 로드되었는지 여부를 추적
    var pHDataLoaded = false; // 압력 데이터가 로드되었는지 여부를 추적

    var co2Data = []; // CO2 데이터를 저장할 배열
    var pHData = []; // 압력 데이터를 저장할 배열

    var temperatureAnnotations = []; // 온도 주석 배열
    var co2Annotations = []; // CO2 주석 배열
    var phAnnotations = []; // CO2 주석 배열

    var timestamps = temperatureData.map((entry) => entry.measured_time);
    var temperatureValues = temperatureData.map(
        (entry) => entry.in_temperature,
    );

    var chartData = {
        labels: timestamps,
        datasets: [
            {
                label: '온도',
                data: temperatureValues,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
            },
        ],
    };

    var lineChart = new Chart(ctxLineChart, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time', // Automatically parses time if your data is in correct format
                    time: {
                        tooltipFormat: 'yyyy-MM-dd HH:mm', // 툴팁에 표시될 형식
                        displayFormats: {
                            day: 'MM-DD', // x축의 범례값 형식 지정
                            hour: 'HH:mm', // x축의 범례값 형식 지정
                        },
                    },
                    ticks: {
                        autoSkip: true, // Automatically skips labels to prevent overlap
                        maxTicksLimit: 28, // Limit the number of ticks to a reasonable number
                        maxRotation: 0, // Keep labels horizontal
                        minRotation: 0, // No rotation for labels
                    },
                    grid: {
                        display: true, // Display grid lines for clarity
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

                annotation: {
                    annotations: temperatureAnnotations,
                },
            },
        },
    });

    // 주석 추가 함수
    function addAnnotations(limits) {
        temperatureAnnotations = [];
        co2Annotations = [];
        phAnnotations = [];

        limits.forEach((limit) => {
            const lowerLine = {
                type: 'line',
                xMin: limit.startdate,
                xMax: limit.enddate,
                yMin: limit.lower_limit,
                yMax: limit.lower_limit,
                borderColor: 'blue',
                borderWidth: 2,
                label: {
                    content: `하한값: ${limit.lower_limit}`,
                    enabled: true,
                    position: 'end',
                },
            };

            const upperLine = {
                type: 'line',
                xMin: limit.startdate,
                xMax: limit.enddate,
                yMin: limit.upper_limit,
                yMax: limit.upper_limit,
                borderColor: 'red',
                borderWidth: 2,
                label: {
                    content: `상한값: ${limit.upper_limit}`,
                    enabled: true,
                    position: 'end',
                },
            };
            if (limit.sensor_type === 'temperature') {
                temperatureAnnotations.push(lowerLine);
                temperatureAnnotations.push(upperLine);
            } else if (limit.sensor_type === 'co2') {
                co2Annotations.push(lowerLine);
                co2Annotations.push(upperLine);
            } else if (limit.sensor_type === 'ph') {
                phAnnotations.push(lowerLine);
                phAnnotations.push(upperLine);
            }
        });
        if (lineChart.data.datasets[0].label === '온도') {
            lineChart.options.plugins.annotation.annotations =
                temperatureAnnotations;
        } else if (lineChart.data.datasets[0].label === '이산화탄소') {
            lineChart.options.plugins.annotation.annotations = co2Annotations;
        } else if (lineChart.data.datasets[0].label === 'PH') {
            lineChart.options.plugins.annotation.annotations = phAnnotations;
        }

        lineChart.update();
    }

    document
        .getElementById('temperature-btn')
        .addEventListener('click', function () {
            lineChart.data.datasets = [
                {
                    label: '온도',
                    data: temperatureValues,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
                },
            ];
            lineChart.options.plugins.annotation.annotations =
                temperatureAnnotations;
            lineChart.resetZoom();
            lineChart.update();
        });

    document.getElementById('co2-btn').addEventListener('click', function () {
        if (!co2DataLoaded) {
            var batchIdsQuery = batchIds.join(',');

            fetch(
                `${baseURL}/api/sensor/dashboard/co2?batchId=${batchIdsQuery}`,
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    co2Data = data.map((entry) => ({
                        measured_time: entry.measured_time,
                        co2_concentration: entry.co2_concentration,
                    }));

                    co2DataLoaded = true;
                    updateChartWithCO2Data();
                })
                .catch((error) =>
                    console.error('Error fetching CO2 data:', error),
                );
        } else {
            updateChartWithCO2Data();
        }
    });

    function updateChartWithCO2Data() {
        var timestamps = co2Data.map((entry) => entry.measured_time);
        var co2Values = co2Data.map((entry) => entry.co2_concentration);

        lineChart.data.labels = timestamps;
        lineChart.data.datasets = [
            {
                label: '이산화탄소',
                data: co2Values,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
            },
        ];
        lineChart.options.plugins.annotation.annotations = co2Annotations;
        lineChart.resetZoom();
        lineChart.update();
    }

    document.getElementById('pH-btn').addEventListener('click', function () {
        if (!pHDataLoaded) {
            var batchIdsQuery = batchIds.join(',');

            fetch(`${baseURL}/api/sensor/dashboard/ph?batchId=${batchIdsQuery}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    pHData = data.map((entry) => ({
                        measured_time: entry.measured_time,
                        ph: entry.ph,
                    }));

                    pHDataLoaded = true;
                    updateChartWithPHData();
                })
                .catch((error) =>
                    console.error('Error fetching ph data:', error),
                );
        } else {
            updateChartWithPHData();
        }
    });

    function updateChartWithPHData() {
        var timestamps = pHData.map((entry) => entry.measured_time);
        var phValues = pHData.map((entry) => entry.ph);

        lineChart.data.labels = timestamps;
        lineChart.data.datasets = [
            {
                label: 'PH',
                data: phValues,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
            },
        ];
        lineChart.options.plugins.annotation.annotations = phAnnotations;
        lineChart.resetZoom();
        lineChart.update();
    }

    function fetchLimitData() {
        var batchIdsQuery = batchIds.join(',');
        fetch(`${baseURL}/dashboard/all-limit?batchId=${batchIdsQuery}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((limits) => {
                addAnnotations(limits);
            })
            .catch((error) =>
                console.error('Error fetching limit data:', error),
            );
    }

    fetchLimitData();

    function fetchLatestData() {
        var batchIdsQuery = batchIds.join(',');
        fetch(`${baseURL}/api/sensor/dashboard/latest?batchId=${batchIdsQuery}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                updateChart(data);
            })
            .catch((error) => {
                console.error('Error fetching latest data:', error);
            });
    }

    function updateChart(data) {
        // 새로운 타임스탬프 추가 (한국 시간으로 변환)
        const measuredTime = new Date(data.latestData.measured_time); // ISO 형식의 날짜를 Date 객체로 변환

        // 한국 시간으로 변환 (UTC+9)
        measuredTime.setHours(measuredTime.getHours() + 9); // UTC에서 9시간 추가

        // 날짜 형식을 YYYY-MM-DD HH:mm 형식으로 변환
        const formattedTime = measuredTime
            .toISOString()
            .slice(0, 16)
            .replace('T', ' ');

        // Update labels
        chartData.labels.push(formattedTime); // 형식화된 문자열로 추가

        // Update temperature data
        if (chartData.datasets[0].label === '온도') {
            chartData.datasets[0].data.push(data.latestData.in_temperature);
        }
        if (chartData.datasets[0].label === '이산화탄소') {
            chartData.datasets[0].data.push(data.latestData.co2_concentration);
        }

        if (chartData.datasets[0].label === 'PH') {
            chartData.datasets[0].data.push(data.latestData.ph);
        }
        lineChart.update();
    }

    // Set an interval to fetch the latest data every minute (60000 milliseconds)
    setInterval(fetchLatestData, 60000);
    fetchLatestData(); // Initial fetch on page load
    // 더블클릭 시 차트 축소 기능 추가
    document
        .getElementById('lineChart')
        .addEventListener('dblclick', function () {
            lineChart.zoom(0.5); // 축소 비율 조정
        });

    // Pan 기능 구현
    let isPanning = false;
    let startX = 0;
    let startY = 0;

    document
        .getElementById('lineChart')
        .addEventListener('mousedown', function (event) {
            if (event.ctrlKey) {
                isPanning = true;
                startX = event.clientX;
                startY = event.clientY;
            }
        });

    document
        .getElementById('lineChart')
        .addEventListener('mousemove', function (event) {
            if (isPanning) {
                const sensitivity = 0.5;
                const deltaX = (event.clientX - startX) * sensitivity;
                const deltaY = (event.clientY - startY) * sensitivity;
                const xScale = lineChart.scales['x'];
                const yScale = lineChart.scales['y'];

                const xMin =
                    xScale.min -
                    (deltaX * (xScale.max - xScale.min)) / xScale.width;
                const xMax =
                    xScale.max -
                    (deltaX * (xScale.max - xScale.min)) / xScale.width;
                const yMin =
                    yScale.min +
                    (deltaY * (yScale.max - yScale.min)) / yScale.height;
                const yMax =
                    yScale.max +
                    (deltaY * (yScale.max - yScale.min)) / yScale.height;

                lineChart.options.scales.x.min = xMin;
                lineChart.options.scales.x.max = xMax;
                lineChart.options.scales.y.min = yMin;
                lineChart.options.scales.y.max = yMax;

                startX = event.clientX;
                startY = event.clientY;
            }
        });

    document.addEventListener('mouseup', function () {
        isPanning = false;
    });

    document
        .querySelector('#val-start-time')
        .addEventListener('input', function () {
            let value = this.value;

            // 양의 정수만 허용
            if (!/^\d*$/.test(value)) {
                this.value = value.replace(/\D/g, '');
            }
        });
    // 모니터링 시간: 숫자만 입력 (시간 단위)
    document
        .querySelector('#val-monitoring-duration')
        .addEventListener('input', function () {
            let value = this.value;
            // 양의 정수만 허용
            if (!/^\d*$/.test(value)) {
                this.value = value.replace(/\D/g, '');
            }
        });
});
