/*
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
                    label: '내부 온도',
                    data: data.type1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '외부 온도',
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
                        unit: 'hour',
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
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
                            return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                            return `${value} (${date.toISOString().replace('T', ' ').slice(0, 16)})`;
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
                        unit: 'hour',
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
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
                            return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                            return `${label}: ${value} (${date.toISOString().replace('T', ' ').slice(0, 16)})`;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
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
*/

let currentChart = null;
let sensorData = [];

document.addEventListener('DOMContentLoaded', async function () {
    // Initial load
    await loadInitialData();

    document.querySelectorAll('.feature-button').forEach(button => {
        button.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            updateChart(sensorData, type);
        });
    });

    document.getElementById('zoomInButton').addEventListener('click', zoomIn);
    document.getElementById('zoomOutButton').addEventListener('click', zoomOut);
    document.getElementById('panLeftButton').addEventListener('click', panLeft);
    document.getElementById('panRightButton').addEventListener('click', panRight);
    document.getElementById('resetZoomButton').addEventListener('click', resetZoom);
});

async function loadInitialData() {
    const response = await fetch('/sensor');
    if (response.ok) {
        const data = await response.json();
        sensorData = data;
        updateChart(sensorData, 'temperature');
    } else {
        console.error('Failed to fetch initial sensor data:', response.statusText);
    }
}

async function searchBatches() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    let url = '/batch/date';
    if (startDate || endDate) {
        url += `?${startDate ? `start=${startDate}` : ''}${startDate && endDate ? '&' : ''}${endDate ? `end=${endDate}` : ''}`;
    }
    const response = await fetch(url);
    const batches = await response.json();
    const batchList = document.getElementById('batch-list');
    batchList.innerHTML = `<option value="">배치를 선택하세요</option>`;
    batches.forEach(batch => {
        const option = document.createElement('option');
        option.value = `${batch.batchId}`;
        option.textContent = `${batch.recipeName} (비율: ${batch.recipeRatio})`;
        batchList.appendChild(option);
    });
    console.log('Batches loaded:', batches);
}

async function loadBatchData() {
    const batchId = document.getElementById('batch-list').value;

    console.log('Selected batchId:', batchId);

    let url = '/sensor';
    if (batchId && batchId !== '') {
        url += `?batchId=${batchId}`;
    }

    const response = await fetch(url);
    if (response.ok) {
        const data = await response.json();
        sensorData = data;
        updateChart(sensorData, 'temperature');
    } else {
        console.error('Failed to fetch sensor data:', response.statusText);
    }
}

function updateChart(data, type) {
    let filteredData;
    switch (type) {
        case 'temperature':
            filteredData = filterDataByType(data, 'inTemperature', 'outTemperature');
            createTemperatureChart(filteredData);
            break;
        case 'brix':
        case 'ph':
        case 'co2Concentration':
            filteredData = filterDataBySingleType(data, type);
            createSingleTypeChart(filteredData, type);
            break;
        default:
            console.error('Unknown type:', type);
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
                    label: '내부 온도',
                    data: data.type1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    tension: 0.1
                },
                {
                    label: '외부 온도',
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
                        unit: 'hour',
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
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
                            return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                            return `${value} (${date.toISOString().replace('T', ' ').slice(0, 16)})`;
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
                        unit: 'hour',
                        tooltipFormat: 'yyyy-MM-dd HH:mm',
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
                            return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                            return `${label}: ${value} (${date.toISOString().replace('T', ' ').slice(0, 16)})`;
                        }
                    }
                },
                legend: {
                    display: false
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

