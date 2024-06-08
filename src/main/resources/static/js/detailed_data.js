document.addEventListener("DOMContentLoaded", function() {
    const chartTitle = document.getElementById('chartTitle');
    const maxValue = document.getElementById('maxValue');
    const minValue = document.getElementById('minValue');
    const avgValue = document.getElementById('avgValue');

    const chartData = {
        temperature: {
            label: 'Temperature',
            data: [],
            max: '',
            min: '',
            avg: '',
            unit: '℃'
        },
        sugar: {
            label: 'Sugar',
            data: [],
            max: '',
            min: '',
            avg: '',
            unit: ''
        },
        ph: {
            label: 'pH',
            data: [],
            max: '',
            min: '',
            avg: '',
            unit: ''
        },
        co2: {
            label: 'CO2',
            data: [],
            max: '',
            min: '',
            avg: '',
            unit: 'ppm'
        }
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: chartData.temperature.label,
                data: chartData.temperature.data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'TIME'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    document.querySelectorAll('.feature-button').forEach(button => {
        button.addEventListener('click', function() {
            const featureType = this.getAttribute('data-type');
            fetchData(featureType);
        });
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const featureType = document.querySelector('.feature-button.active').getAttribute('data-type');
        fetchData(featureType, startDate, endDate);
    });

    function fetchData(featureType, startDate = null, endDate = null) {
        let url = `/sensor/date-range?start=${startDate}&end=${endDate}&batchId=1`; // Assuming batchId is 1 for example
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const selectedData = chartData[featureType];
                selectedData.data = data.map(d => d[featureType]);
                selectedData.max = `최고 ${selectedData.label}: ${Math.max(...selectedData.data)}${selectedData.unit}`;
                selectedData.min = `최저 ${selectedData.label}: ${Math.min(...selectedData.data)}${selectedData.unit}`;
                selectedData.avg = `평균 ${selectedData.label}: ${(selectedData.data.reduce((a, b) => a + b, 0) / selectedData.data.length).toFixed(2)}${selectedData.unit}`;

                myChart.data.labels = data.map(d => new Date(d.measuredTime).toLocaleTimeString());
                myChart.data.datasets[0].label = selectedData.label;
                myChart.data.datasets[0].data = selectedData.data;
                myChart.update();

                chartTitle.textContent = selectedData.label;
                maxValue.textContent = selectedData.max;
                minValue.textContent = selectedData.min;
                avgValue.textContent = selectedData.avg;
            })
            .catch(error => console.error('Error fetching data:', error));
    }
});
