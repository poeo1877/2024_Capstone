document.addEventListener("DOMContentLoaded", function () {
	var ctxLineChart = document.getElementById("lineChart").getContext("2d");
	var baseURL = window.location.origin;
	var co2DataLoaded = false; // CO2 데이터가 로드되었는지 여부를 추적
	var pressureDataLoaded = false; // 압력 데이터가 로드되었는지 여부를 추적

	var co2Data = []; // CO2 데이터를 저장할 배열
	var pressureData = []; // 압력 데이터를 저장할 배열

	var annotations = []; // 주석을 저장할 배열

	var timestamps = temperatureData.map((entry) => entry.measured_time);

	var temperatureValues = temperatureData.map(
		(entry) => entry.in_temperature
	);

	var chartData = {
		labels: timestamps,
		datasets: [
			{
				label: "온도",
				data: temperatureValues,
				borderColor: "rgba(75, 192, 192, 1)",
				borderWidth: 2,
				fill: false,
				pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
			},
		],
	};
	var lineChart = new Chart(ctxLineChart, {
		type: "line",
		data: chartData,
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
						modifierKey: null, // No modifier key required for panning
						threshold: 10, // Minimal pan distance required before actually panning
					},
					zoom: {
						wheel: {
							enabled: false, // Disable zooming with the mouse wheel
						},
						drag: {
							enabled: true, // 드래그로 줌 가능
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
					annotations:
						annotations.filter(
							(annotation) => {
								// 현재 활성화된 센서에 따라 주석 필터링
								const isTemperatureSensorActive =
									sensorVisibility.temperature &&
									annotation.sensorType ===
										'temperature';
								const isCo2SensorActive =
									sensorVisibility.co2 &&
									annotation.sensorType ===
										'co2';
								const isPressureSensorActive =
									sensorVisibility.pressure &&
									annotation.sensorType ===
										'pressure';
								return (
									isTemperatureSensorActive ||
									isCo2SensorActive ||
									isPressureSensorActive
								);
							},
						),
				},
			},
		},
	});

	document
		.getElementById("temperature-btn")
		.addEventListener("click", function () {
			lineChart.data.datasets = [
				{
					label: "온도",
					data: temperatureValues,
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 2,
					fill: false,
					pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
				},
			];
			lineChart.resetZoom();
			lineChart.update();
		});

	// CO2 데이터 로드 버튼 클릭 이벤트 핸들러
	document.getElementById("co2-btn").addEventListener("click", function () {
		if (!co2DataLoaded) {
			// batchIds 배열을 콤마로 구분된 문자열로 변환
			var batchIdsQuery = batchIds.join(",");

			fetch(`${baseURL}/api/sensor/co2?batchId=${batchIdsQuery}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.json();
				})
				.then((data) => {
					// CO2 데이터 저장
					co2Data = data.map((entry) => ({
						measured_time: entry.measured_time,
						co2_concentration: entry.co2_concentration,
					}));

					co2DataLoaded = true; // CO2 데이터가 로드되었음을 표시
					updateChartWithCO2Data();
				})
				.catch((error) =>
					console.error("Error fetching CO2 data:", error)
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
				label: "이산화탄소",
				data: co2Values,
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 2,
				fill: false,
				pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
			},
		];
		lineChart.resetZoom();
		lineChart.update();
	}

	// 압력 데이터 로드 버튼 클릭 이벤트 핸들러
	document
		.getElementById("pressure-btn")
		.addEventListener("click", function () {
			if (!pressureDataLoaded) {
				// batchIds 배열을 콤마로 구분된 문자열로 변환
				var batchIdsQuery = batchIds.join(",");

				fetch(`${baseURL}/api/sensor/pressure?batchId=${batchIdsQuery}`)
					.then((response) => {
						if (!response.ok) {
							throw new Error("Network response was not ok");
						}
						return response.json();
					})
					.then((data) => {
						// 압력 데이터 저장
						pressureData = data.map((entry) => ({
							measured_time: entry.measured_time,
							pressure_upper: entry.pressure_upper,
						}));

						pressureDataLoaded = true; // 압력 데이터가 로드되었음을 표시
						updateChartWithPressureData();
					})
					.catch((error) =>
						console.error("Error fetching pressure data:", error)
					);
			} else {
				updateChartWithPressureData();
			}
		});

	function updateChartWithPressureData() {
		var timestamps = pressureData.map((entry) => entry.measured_time);
		var pressureValues = pressureData.map((entry) => entry.pressure_upper);

		lineChart.data.labels = timestamps;
		lineChart.data.datasets = [
			{
				label: "압력",
				data: pressureValues,
				borderColor: "rgba(54, 162, 235, 1)",
				borderWidth: 2,
				fill: false,
				pointRadius: 0, // 데이터 포인트의 크기를 작게 설정
			},
		];
		lineChart.resetZoom();
		lineChart.update();
	}

	function setAnnotation() {
		annotations = [];
		const upperLimit = parseFloat(
			document.getElementById(
				'val-upper-limit',
			).value,
		);
		const lowerLimit = parseFloat(
			document.getElementById(
				'val-lower-limit',
			).value,
		);
		const sensorType =
			document.getElementById(
				'val-sensor',
			).value;
		const dateRange =
			document.getElementById(
				'val-daterange',
			).value;
		const dates = dateRange.split(' - '); // 기간을 구분자로 나눔
		if (dates.length < 2) {
			alert('기간을 올바르게 선택해 주세요.');
			return;
		}
		const startDate = dates[0].trim(); // 시작 날짜
		const endDate = dates[1].trim(); // 종료 날짜 설정

		// 유효성 검사
		if (
			isNaN(upperLimit) ||
			isNaN(lowerLimit) ||
			!sensorType
		) {
			alert(
				'상한값, 하한값, 센서 종류를 정확히 입력하세요.',
			);
			return;
		}

		// 경계선을 주석으로 추가
		annotations.push({
			type: 'line',
			sensorType: sensorType, // 추가된 sensorType 필드
			display: sensorVisibility[sensorType], // 센서 가시성에 따라 display 속성 설정
			xMin: new Date(startDate), // 시작 날짜를 Date 객체로 설정
			xMax: new Date(endDate), // 종료 날짜를 Date 객체로 설정
			yMin: upperLimit,
			yMax: upperLimit,
			label: {
				content: '상한값',
				enabled: true,
				position: 'right',
			},
			borderColor: 'red',
			borderWidth: 2,
		});

		annotations.push({
			type: 'line',
			sensorType: sensorType, // 추가된 sensorType 필드
			display: sensorVisibility[sensorType], // 센서 가시성에 따라 display 속성 설정
			xMin: new Date(startDate), // 시작 날짜를 Date 객체로 설정
			xMax: new Date(endDate), // 종료 날짜를 Date 객체로 설정
			yMin: lowerLimit,
			yMax: lowerLimit,
			label: {
				content: '하한값',
				enabled: true,
				position: 'right',
			},
			borderColor: 'blue',
			borderWidth: 2,
		});

		lineChart.update();
	}


	// 더블클릭 시 차트 축소 기능 추가
	document
		.getElementById("lineChart")
		.addEventListener("dblclick", function () {
			lineChart.zoom(0.5); // 축소 비율 조정
		});

	// Pan 기능 구현
	let isPanning = false;
	let startX = 0;
	let startY = 0;

	document
		.getElementById("lineChart")
		.addEventListener("mousedown", function (event) {
			if (event.ctrlKey) {
				isPanning = true;
				startX = event.clientX;
				startY = event.clientY;
			}
		});

	document
		.getElementById("lineChart")
		.addEventListener("mousemove", function (event) {
			if (isPanning) {
				const sensitivity = 0.5; // 민감도 조절을 위한 비율 (0.5로 설정하여 민감도를 낮춤)
				const deltaX = (event.clientX - startX) * sensitivity;
				const deltaY = (event.clientY - startY) * sensitivity;
				const xScale = lineChart.scales["x"];
				const yScale = lineChart.scales["y"];

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

	document.addEventListener("mouseup", function () {
		isPanning = false;
	});
});
