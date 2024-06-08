let currentChart = null;

document.addEventListener('DOMContentLoaded', async function () {
    const response = await fetch('/sensor');
    const data = await response.json();
    updateChart(data, 'temperature');

    document.querySelectorAll('.feature-button').forEach(button => {
        button.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            updateChart(data, type);
        });
    });

    document.getElementById('zoomInButton').addEventListener('click', zoomIn);
    document.getElementById('zoomOutButton').addEventListener('click', zoomOut);
    document.getElementById('panLeftButton').addEventListener('click', panLeft);
    document.getElementById('panRightButton').addEventListener('click', panRight);
    document.getElementById('resetZoomButton').addEventListener('click', resetZoom);
});

function updateChart(data, type) {
    let filteredData;
    switch (type) {
        case 'temperature':
            filteredData = filterDataByType(data, 'inTemperature', 'outTemperature');
            createTemperatureChart(filteredData);
            break;
        default:
            filteredData = filterDataBySingleType(data, type);
            createSingleTypeChart(filteredData, type);
            break;
    }
}

function filterDataBySingleType(data, type) {
    return data.map(item => ({
        x: new Date(item.measuredTime),
        y: item[type]
    }));
}

function filterDataByType(data, type1, type2) {
    return {
        type1: data.map(item => ({
            x: new Date(item.measuredTime),
            y: item[type1]
        })),
        type2: data.map(item => ({
            x: new Date(item.measuredTime),
            y: item[type2]
        }))
    };
}

function createTemperatureChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    const allData = data.type1.concat(data.type2);
    const minValue = Math.min(...allData.map(d => d.y));
    const maxValue = Math.max(...allData.map(d => d.y));
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'Internal Temperature',
                    data: data.type1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'External Temperature',
                    data: data.type2,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        source: 'auto',
                        maxRotation: 0,
                        autoSkip: true,
                        callback: function (val, index, ticks) {
                            return new Date(val).toLocaleTimeString();
                        }
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        drag: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                        rangeMin: {
                            x: null
                        },
                        rangeMax: {
                            x: null
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw.y !== undefined ? context.raw.y : context.raw;
                            const date = new Date(context.raw.x);
                            return `${label}: ${value} (${date.toISOString().replace('T', ' ').slice(0, 19)})`;
                        }
                    }
                }
            }
        }
    });

    // Adjust initial zoom level if data points exceed 48
    if (data.type1.length > 48 || data.type2.length > 48) {
        currentChart.zoom(1.5); // Adjust zoom level as needed
    }
}

function createSingleTypeChart(data, type) {
    const ctx = document.getElementById('myChart').getContext('2d');

    if (currentChart) {
        currentChart.destroy();
    }

    const minValue = Math.min(...data.map(d => d.y));
    const maxValue = Math.max(...data.map(d => d.y));
    const range = maxValue - minValue;
    const padding = range * 0.1; // 10% padding
    const yMin = minValue - padding;
    const yMax = maxValue + padding;

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: type,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'yyyy-MM-dd HH:mm:ss',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        source: 'auto',
                        maxRotation: 0,
                        autoSkip: true,
                        callback: function (val, index, ticks) {
                            return new Date(val).toLocaleTimeString();
                        }
                    }
                },
                y: {
                    min: yMin,
                    max: yMax,
                    title: {
                        display: true,
                        text: type
                    }
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        drag: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                        rangeMin: {
                            x: null
                        },
                        rangeMax: {
                            x: null
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.raw.y !== undefined ? context.raw.y : context.raw;
                            const date = new Date(context.raw.x);
                            return `${label}: ${value} (${date.toISOString().replace('T', ' ').slice(0, 19)})`;
                        }
                    }
                }
            }
        }
    });

    // Adjust initial zoom level if data points exceed 48
    if (data.length > 48) {
        currentChart.zoom(1.5); // Adjust zoom level as needed
    }
}

function zoomIn() {
    currentChart.zoom(1.1);
}

function zoomOut() {
    currentChart.zoom(0.9);
}

function panLeft() {
    currentChart.pan({x: -10});
}

function panRight() {
    currentChart.pan({x: 10});
}

function resetZoom() {
    currentChart.resetZoom();
}

async function searchData() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const response = await fetch(`/sensor?start=${startDate}&end=${endDate}`);
    const data = await response.json();
    updateChart(data, 'temperature');
}
