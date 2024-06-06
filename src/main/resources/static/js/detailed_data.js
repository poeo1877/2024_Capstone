document.addEventListener("DOMContentLoaded", function() {
    const chartTitle = document.getElementById('chartTitle');
    const maxValue = document.getElementById('maxValue');
    const minValue = document.getElementById('minValue');
    const avgValue = document.getElementById('avgValue');

    const chartData = {
        temperature: {
            label: 'Temperature',
            data: [5, 10, 15, 10, 20, 15, 25, 20, 15, 10, 5],
            max: '최고 온도: 4℃',
            min: '최저 온도: 19℃',
            avg: '평균 온도: 13℃',
            unit: '℃'
        },
        sugar: {
            label: 'Sugar',
            data: [3, 7, 10, 6, 15, 12, 18, 14, 10, 7, 3],
            max: '최고 당도: 18',
            min: '최저 당도: 3',
            avg: '평균 당도: 10',
            unit: ''
        },
        ph: {
            label: 'pH',
            data: [4, 4.5, 5, 4.8, 5.2, 4.7, 5.5, 5, 4.6, 4.4, 4],
            max: '최고 pH: 5.5',
            min: '최저 pH: 4',
            avg: '평균 pH: 4.7',
            unit: ''
        },
        co2: {
            label: 'CO2',
            data: [400, 420, 450, 430, 470, 460, 480, 470, 450, 420, 400],
            max: '최고 CO2 농도: 480ppm',
            min: '최저 CO2 농도: 400ppm',
            avg: '평균 CO2 농도: 450ppm',
            unit: 'ppm'
        }
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    let myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'],
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
            const selectedData = chartData[featureType];

            myChart.data.datasets[0].label = selectedData.label;
            myChart.data.datasets[0].data = selectedData.data;
            myChart.update();

            chartTitle.textContent = selectedData.label;
            maxValue.textContent = selectedData.max;
            minValue.textContent = selectedData.min;
            avgValue.textContent = selectedData.avg;
        });
    });
});
