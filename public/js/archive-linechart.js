	

// 	function setAnnotation() {
// 		annotations = [];
// 		const upperLimit = parseFloat(document.getElementById("val-upper-limit").value);
// 		const lowerLimit = parseFloat(document.getElementById("val-lower-limit").value);
// 		const sensorType = document.getElementById("val-sensor").value;
// 		const dateRange = document.getElementById("val-daterange").value;
// 		const dates = dateRange.split(" - "); // 기간을 구분자로 나눔
// 		if (dates.length < 2) {
// 			alert("기간을 올바르게 선택해 주세요.");
// 			return;
// 		}
// 		const startDate = dates[0].trim(); // 시작 날짜
// 		const endDate = dates[1].trim(); // 종료 날짜 설정

// 		// 유효성 검사
// 		if (isNaN(upperLimit) || isNaN(lowerLimit) || !sensorType) {
// 			alert("상한값, 하한값, 센서 종류를 정확히 입력하세요.");
// 			return;
// 		}

// 		// 경계선을 주석으로 추가
// 		annotations.push({
// 			type: "line",
// 			sensorType: sensorType, // 추가된 sensorType 필드
// 			display: sensorVisibility[sensorType], // 센서 가시성에 따라 display 속성 설정
// 			xMin: new Date(startDate), // 시작 날짜를 Date 객체로 설정
// 			xMax: new Date(endDate), // 종료 날짜를 Date 객체로 설정
// 			yMin: upperLimit,
// 			yMax: upperLimit,
// 			label: {
// 				content: "상한값",
// 				enabled: true,
// 				position: "right",
// 			},
// 			borderColor: "red",
// 			borderWidth: 2,
// 		});

// 		annotations.push({
// 			type: "line",
// 			sensorType: sensorType, // 추가된 sensorType 필드
// 			display: sensorVisibility[sensorType], // 센서 가시성에 따라 display 속성 설정
// 			xMin: new Date(startDate), // 시작 날짜를 Date 객체로 설정
// 			xMax: new Date(endDate), // 종료 날짜를 Date 객체로 설정
// 			yMin: lowerLimit,
// 			yMax: lowerLimit,
// 			label: {
// 				content: "하한값",
// 				enabled: true,
// 				position: "right",
// 			},
// 			borderColor: "blue",
// 			borderWidth: 2,
// 		});

// 		lineChart.update();
// 	}



// 	// // Pan 기능 구현
// 	// let isPanning = false;
// 	// let startX = 0;
// 	// let startY = 0;

// 	// document.getElementById("lineChart").addEventListener("mousedown", function (event) {
// 	// 	if (event.ctrlKey) {
// 	// 		isPanning = true;
// 	// 		startX = event.clientX;
// 	// 		startY = event.clientY;
// 	// 	}
// 	// });

// 	// document.getElementById("lineChart").addEventListener("mousemove", function (event) {
// 	// 	if (isPanning) {
// 	// 		const sensitivity = 0.5; // 민감도 조절을 위한 비율 (0.5로 설정하여 민감도를 낮춤)
// 	// 		const deltaX = (event.clientX - startX) * sensitivity;
// 	// 		const deltaY = (event.clientY - startY) * sensitivity;
// 	// 		const xScale = lineChart.scales["x"];
// 	// 		const yScale = lineChart.scales["y"];

// 	// 		const xMin = xScale.min - (deltaX * (xScale.max - xScale.min)) / xScale.width;
// 	// 		const xMax = xScale.max - (deltaX * (xScale.max - xScale.min)) / xScale.width;
// 	// 		const yMin = yScale.min + (deltaY * (yScale.max - yScale.min)) / yScale.height;
// 	// 		const yMax = yScale.max + (deltaY * (yScale.max - yScale.min)) / yScale.height;

// 	// 		lineChart.options.scales.x.min = xMin;
// 	// 		lineChart.options.scales.x.max = xMax;
// 	// 		lineChart.options.scales.y.min = yMin;
// 	// 		lineChart.options.scales.y.max = yMax;

// 	// 		startX = event.clientX;
// 	// 		startY = event.clientY;
// 	// 	}
// 	// });

// 	// document.addEventListener("mouseup", function () {
// 	// 	isPanning = false;
// 	// });
// });


document.addEventListener("DOMContentLoaded", function () {
    var ctxTemperatureChart = document.getElementById("temperatureChart").getContext("2d");
    var ctxCo2Chart = document.getElementById("co2Chart").getContext("2d");
    var ctxPressureChart = document.getElementById("pressureChart").getContext("2d");

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
        return batchIds.map(batchId => {
            return {
                label: `Batch ${batchId}`,
                data: data.filter(entry => entry.batch_id === batchId).map(entry => ({
                    x: entry.measured_time,
                    y: entry[key]
                })),
                borderColor: getRandomColor(),
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            };
        });
    }

    // 차트 생성 함수
    function createChart(ctx, datasets) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					x: {
						type: "time", // Automatically parses time if your data is in correct format
						time: {
							tooltipFormat: "yyyy-MM-dd HH:mm", // 툴팁에 표시될 형식
							displayFormats: {
								day: "MM-DD", // x축의 범례값 형식 지정
								hour: "HH:mm", // x축의 범례값 형식 지정
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
					zoom: {
						pan: {
							enabled: true, // Enable panning
							mode: "xy", // Allow panning in both directions
							modifierKey: 'ctrl', // No modifier key required for panning
							threshold: 10, // Minimal pan distance required before actually panning
						},
						zoom: {
							wheel: {
								enabled: true, // Disable zooming with the mouse wheel
							},
							drag: {
								enabled: false, // 드래그로 줌 가능
								threshold: 100, // 드래그 줌을 시작하기 위한 최소 드래그 거리
								borderWidth: 1, // 드래그 줌 영역의 테두리 두께
								backgroundColor: "rgba(0, 0, 0, 0.1)", // 드래그 줌 영역의 배경색
							},
							pinch: {
								enabled: true, // Enable zooming by pinching on touch devices
							},
							mode: "xy",
						},
					},
					annotation: {
						annotations: temperatureAnnotations,
					},
				},
			},
        });
    }

    // 온도 차트 생성
    var temperatureDatasets = createDatasets(temperatureData, 'in_temperature');
    var temperatureChart = createChart(ctxTemperatureChart, temperatureDatasets);

    // CO2 차트 생성
    var co2Datasets = createDatasets(co2Data, 'co2_concentration');
    var co2Chart = createChart(ctxCo2Chart, co2Datasets);

    // 압력 차트 생성
    var pressureDatasets = createDatasets(pressureData, 'pressure_upper');
    var pressureChart = createChart(ctxPressureChart, pressureDatasets);
	
	
	// 더블클릭 이벤트 핸들러 추가
    function addDoubleClickZoomOut(chart, chartElementId) {
        document.getElementById(chartElementId).addEventListener("dblclick", function () {
            chart.zoom(0.5); // 차트를 원래 크기로 축소
        });
    }

	addDoubleClickZoomOut(temperatureChart, "temperatureChart");
    addDoubleClickZoomOut(co2Chart, "co2Chart");
    addDoubleClickZoomOut(pressureChart, "pressureChart");

    document.getElementById("temperature-btn").addEventListener("click", function () {
        document.getElementById("temperatureChart").style.display = "block";
        document.getElementById("co2Chart").style.display = "none";
        document.getElementById("pressureChart").style.display = "none";
        temperatureChart.resetZoom();
        temperatureChart.update();
    });

    document.getElementById("co2-btn").addEventListener("click", function () {
        if (!co2DataLoaded) {
            var batchIdsQuery = batchIds.join(",");
            fetch(`${baseURL}/api/sensor/co2?batchId=${batchIdsQuery}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    co2Data = data.map((entry) => ({
                        measured_time: entry.measured_time,
                        co2_concentration: entry.co2_concentration,
                        batch_id: entry.batch_id
                    }));
                    co2DataLoaded = true;
                    co2Datasets = createDatasets(co2Data, 'co2_concentration');
                    co2Chart.data.datasets = co2Datasets;
                    co2Chart.update();
                })
                .catch((error) => console.error("Error fetching CO2 data:", error));
        } else {
            co2Chart.update();
        }
        document.getElementById("temperatureChart").style.display = "none";
        document.getElementById("co2Chart").style.display = "block";
        document.getElementById("pressureChart").style.display = "none";
    });

    document.getElementById("pressure-btn").addEventListener("click", function () {
        if (!pressureDataLoaded) {
            var batchIdsQuery = batchIds.join(",");
            fetch(`${baseURL}/api/sensor/pressure?batchId=${batchIdsQuery}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then((data) => {
                    pressureData = data.map((entry) => ({
                        measured_time: entry.measured_time,
                        pressure_upper: entry.pressure_upper,
                        batch_id: entry.batch_id
                    }));
                    pressureDataLoaded = true;
                    pressureDatasets = createDatasets(pressureData, 'pressure_upper');
                    pressureChart.data.datasets = pressureDatasets;
                    pressureChart.update();
                })
                .catch((error) => console.error("Error fetching pressure data:", error));
        } else {
            pressureChart.update();
        }
        document.getElementById("temperatureChart").style.display = "none";
        document.getElementById("co2Chart").style.display = "none";
        document.getElementById("pressureChart").style.display = "block";
    });
});