document.addEventListener("DOMContentLoaded", function () {
	var ctx = document.getElementById("lineChart").getContext("2d");
	var timestamps = JSON.parse(
		document.getElementById("timestamps").textContent
	);
	var temperatureData = JSON.parse(
		document.getElementById("temperatureData").textContent
	);
	var co2Data = JSON.parse(document.getElementById("co2Data").textContent);
	var pressureData = JSON.parse(
		document.getElementById("pressureData").textContent
	);

	var chartData = {
		labels: timestamps,
		datasets: [
			{
				label: "온도",
				data: temperatureData,
				borderColor: "rgba(75, 192, 192, 1)",
				borderWidth: 1,
				fill: false,
			},
		],
	};

	var lineChart = new Chart(ctx, {
		type: "line",
		data: chartData,
		options: {
			scales: {
				xAxes: [
					{
						type: "time", // Automatically parses time if your data is in correct format
						ticks: {
							autoSkip: true, // Automatically skips labels to prevent overlap
							maxRotation: 0, // Keep labels horizontal
							minRotation: 0, // No rotation for labels
						},
						gridLines: {
							display: true, // Display grid lines for clarity
						},
					},
				],
			},
			plugins: {
				zoom: {
					pan: {
						enabled: true,
						mode: "x",
					},
					zoom: {
						enabled: true,
						mode: "x",
					},
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
					data: temperatureData,
					borderColor: "rgba(75, 192, 192, 1)",
					borderWidth: 1,
					fill: false,
				},
			];
			lineChart.update();
		});

	document.getElementById("co2-btn").addEventListener("click", function () {
		lineChart.data.datasets = [
			{
				label: "이산화탄소",
				data: co2Data,
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
				fill: false,
			},
		];
		lineChart.update();
	});

	document
		.getElementById("pressure-btn")
		.addEventListener("click", function () {
			lineChart.data.datasets = [
				{
					label: "압력",
					data: pressureData,
					borderColor: "rgba(54, 162, 235, 1)",
					borderWidth: 1,
					fill: false,
				},
			];
			lineChart.update();
		});
});
