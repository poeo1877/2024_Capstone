document.addEventListener("DOMContentLoaded", function() {
    // Sidebar toggle function
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const containers = document.querySelectorAll('.container');
        const header = document.querySelector('.header');
        const isHidden = sidebar.classList.contains('hidden');

        if (isHidden) {
            sidebar.classList.remove('hidden');
            containers.forEach(container => container.classList.remove('collapsed'));
            header.classList.remove('collapsed');
        } else {
            sidebar.classList.add('hidden');
            containers.forEach(container => container.classList.add('collapsed'));
            header.classList.add('collapsed');
        }
    }

    // Add new batch function
    function addBatch() {
        const batchList = document.querySelector('.batch-list');
        const batchCount = batchList.querySelectorAll('.batch-item').length;
        const newBatch = document.createElement('div');
        newBatch.className = 'batch-item';
        newBatch.innerHTML = `<span>Batch ${batchCount + 1}</span>
                          <button class="options-button">...</button>
                          <div class="batch-options hidden">
                              <button class="rename-button">이름 변경</button>
                              <button class="remove-button">삭제</button>
                          </div>`;
        batchList.insertBefore(newBatch, batchList.lastElementChild);

        const newContainer = document.createElement('div');
        newContainer.id = `batch${batchCount + 1}Container`;
        newContainer.className = 'container';
        newContainer.innerHTML = `
          <div class="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-6">
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="card lg:col-span-2">
                      <div class="flex justify-between items-center mb-4 py-4">
                          <h2>현재 상태</h2>
                      </div>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                          <div class="card">
                              <div class="value text-orange-500">0.0°C</div>
                              <div class="change text-red-500">0.0% ↑</div>
                              <p>온도</p>
                          </div>
                          <div class="card">
                              <div class="value text-orange-500">0.0</div>
                              <div class="change text-blue-500">0.0% ↓</div>
                              <p>당도</p>
                          </div>
                          <div class="card">
                              <div class="value">0.0</div>
                              <div class="change text-red-500">0.0% ↑</div>
                              <p>pH</p>
                          </div>
                          <div class="card">
                              <div class="value">0.0</div>
                              <div class="change text-red-500">0.0% ↑</div>
                              <p>이산화탄소 농도</p>
                          </div>
                      </div>
                  </div>
                  <div class="card">
                      <canvas id="radarChart${batchCount + 1}"></canvas>
                      <div class="slider-label">
                          <span>Aromatics</span>
                      </div>
                      <div class="input-container">
                          <input type="range" min="0" max="5" step="0.1" value="3.0" id="aromaticsSlider${batchCount + 1}">
                          <input type="number" min="0" max="5" step="0.1" value="3.0" id="aromaticsInput${batchCount + 1}">
                      </div>
                      <div class="slider-label">
                          <span>Acidity</span>
                      </div>
                      <div class="input-container">
                          <input type="range" min="0" max="5" step="0.1" value="4.0" id="aciditySlider${batchCount + 1}">
                          <input type="number" min="0" max="5" step="0.1" value="4.0" id="acidityInput${batchCount + 1}">
                      </div>
                      <div class="slider-label">
                          <span>Sweetness</span>
                      </div>
                      <div class="input-container">
                          <input type="range" min="0" max="5" step="0.1" value="2.0" id="sweetnessSlider${batchCount + 1}">
                          <input type="number" min="0" max="5" step="0.1" value="2.0" id="sweetnessInput${batchCount + 1}">
                      </div>
                      <div class="slider-label">
                          <span>Aftertaste</span>
                      </div>
                      <div class="input-container">
                          <input type="range" min="0" max="5" step="0.1" value="5.0" id="aftertasteSlider${batchCount + 1}">
                          <input type="number" min="0" max="5" step="0.1" value="5.0" id="aftertasteInput${batchCount + 1}">
                      </div>
                      <div class="slider-label">
                          <span>Body</span>
                      </div>
                      <div class="input-container">
                          <input type="range" min="0" max="5" step="0.1" value="3.0" id="bodySlider${batchCount + 1}">
                          <input type="number" min="0" max="5" step="0.1" value="3.0" id="bodyInput${batchCount + 1}">
                      </div>
                  </div>
              </div>
          </div>
      `;
        document.body.appendChild(newContainer);

        initializeChart(batchCount + 1);
        addEventListenersToBatch(newBatch, batchCount + 1);
        addEventListenersToSliders(batchCount + 1); // 슬라이더에 이벤트 리스너 추가
    }

    // Initialize the radar chart for a given batch number
    function initializeChart(batchNumber) {
        const ctx = document.getElementById(`radarChart${batchNumber}`).getContext('2d');
        const radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Aromatics', 'Acidity', 'Sweetness', 'Aftertaste', 'Body'],
                datasets: [{
                    label: 'Dataset',
                    data: [3, 4, 2, 5, 3],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                }]
            },
            options: {
                scales: {
                    r: {
                        min: 0,
                        max: 5,
                        ticks: {
                            beginAtZero: true,
                            stepSize: 1
                        }
                    }
                }
            }
        });

        // 차트를 슬라이더 값에 따라 업데이트하는 함수
        function updateChart() {
            const aromatics = parseFloat(document.getElementById(`aromaticsSlider${batchNumber}`).value);
            const acidity = parseFloat(document.getElementById(`aciditySlider${batchNumber}`).value);
            const sweetness = parseFloat(document.getElementById(`sweetnessSlider${batchNumber}`).value);
            const aftertaste = parseFloat(document.getElementById(`aftertasteSlider${batchNumber}`).value);
            const body = parseFloat(document.getElementById(`bodySlider${batchNumber}`).value);
            radarChart.data.datasets[0].data = [aromatics, acidity, sweetness, aftertaste, body];
            radarChart.update();
            document.getElementById(`aromaticsInput${batchNumber}`).value = aromatics.toFixed(1);
            document.getElementById(`acidityInput${batchNumber}`).value = acidity.toFixed(1);
            document.getElementById(`sweetnessInput${batchNumber}`).value = sweetness.toFixed(1);
            document.getElementById(`aftertasteInput${batchNumber}`).value = aftertaste.toFixed(1);
            document.getElementById(`bodyInput${batchNumber}`).value = body.toFixed(1);
        }

        // input 값을 슬라이더에 맞추어 업데이트하는 함수
        function updateSliderFromInput() {
            const aromatics = parseFloat(document.getElementById(`aromaticsInput${batchNumber}`).value);
            const acidity = parseFloat(document.getElementById(`acidityInput${batchNumber}`).value);
            const sweetness = parseFloat(document.getElementById(`sweetnessInput${batchNumber}`).value);
            const aftertaste = parseFloat(document.getElementById(`aftertasteInput${batchNumber}`).value);
            const body = parseFloat(document.getElementById(`bodyInput${batchNumber}`).value);
            document.getElementById(`aromaticsSlider${batchNumber}`).value = aromatics;
            document.getElementById(`aciditySlider${batchNumber}`).value = acidity;
            document.getElementById(`sweetnessSlider${batchNumber}`).value = sweetness;
            document.getElementById(`aftertasteSlider${batchNumber}`).value = aftertaste;
            document.getElementById(`bodySlider${batchNumber}`).value = body;
            updateChart();
        }

        document.getElementById(`aromaticsSlider${batchNumber}`).addEventListener('input', updateChart);
        document.getElementById(`aciditySlider${batchNumber}`).addEventListener('input', updateChart);
        document.getElementById(`sweetnessSlider${batchNumber}`).addEventListener('input', updateChart);
        document.getElementById(`aftertasteSlider${batchNumber}`).addEventListener('input', updateChart);
        document.getElementById(`bodySlider${batchNumber}`).addEventListener('input', updateChart);
        document.getElementById(`aromaticsInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
        document.getElementById(`acidityInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
        document.getElementById(`sweetnessInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
        document.getElementById(`aftertasteInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
        document.getElementById(`bodyInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
    }

    // Add event listeners to a new batch element
    function addEventListenersToBatch(batchElement, batchNumber) {
        batchElement.querySelector('span').addEventListener('click', () => showBatchContent(batchNumber));
        batchElement.querySelector('.options-button').addEventListener('click', function() {
            toggleBatchOptions(this);
        });
        batchElement.querySelector('.rename-button').addEventListener('click', function() { renameBatch(this); });
        batchElement.querySelector('.remove-button').addEventListener('click', function() { removeBatch(this); });
    }

    // Show batch content function
    function showBatchContent(batchNumber) {
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => container.classList.remove('active'));
        document.getElementById(`batch${batchNumber}Container`).classList.add('active');
    }

    // Rename batch function
    function renameBatch(button) {
        const batchItem = button.closest('.batch-item');
        const newName = prompt("Enter new name:");
        if (newName) {
            batchItem.querySelector('span').textContent = newName;
        }
    }

    // Remove batch function
    function removeBatch(button) {
        const batchItem = button.closest('.batch-item');
        const batchIndex = Array.from(batchItem.parentElement.children).indexOf(batchItem);
        batchItem.remove();
        const batchContainer = document.getElementById(`batch${batchIndex + 1}Container`);
        if (batchContainer) batchContainer.remove();
    }

    // Toggle batch options visibility function
    function toggleBatchOptions(button) {
        const options = button.nextElementSibling;
        options.classList.toggle('visible');
    }

    // Add event listeners to initial elements
    document.querySelector('.menu-button').addEventListener('click', toggleSidebar);
    document.querySelector('.batch-list > button').addEventListener('click', addBatch);
    document.querySelector('.options-button').addEventListener('click',toggleBatchOptions);
    const batchItems = document.querySelectorAll('.batch-item');
    batchItems.forEach((item, index) => {
        addEventListenersToBatch(item, index + 1);
    });

    // Initialize chart and event listeners for the first batch
    initializeChart(1);
    addEventListenersToSliders(1); // 슬라이더에 이벤트 리스너 추가
});

function addEventListenersToSliders(batchNumber) {
    function updateChart() {
        const aromatics = parseFloat(document.getElementById(`aromaticsSlider${batchNumber}`).value);
        const acidity = parseFloat(document.getElementById(`aciditySlider${batchNumber}`).value);
        const sweetness = parseFloat(document.getElementById(`sweetnessSlider${batchNumber}`).value);
        const aftertaste = parseFloat(document.getElementById(`aftertasteSlider${batchNumber}`).value);
        const body = parseFloat(document.getElementById(`bodySlider${batchNumber}`).value);
        radarChart.data.datasets[0].data = [aromatics, acidity, sweetness, aftertaste, body];
        radarChart.update();
        document.getElementById(`aromaticsInput${batchNumber}`).value = aromatics.toFixed(1);
        document.getElementById(`acidityInput${batchNumber}`).value = acidity.toFixed(1);
        document.getElementById(`sweetnessInput${batchNumber}`).value = sweetness.toFixed(1);
        document.getElementById(`aftertasteInput${batchNumber}`).value = aftertaste.toFixed(1);
        document.getElementById(`bodyInput${batchNumber}`).value = body.toFixed(1);
    }

    function updateSliderFromInput() {
        const aromatics = parseFloat(document.getElementById(`aromaticsInput${batchNumber}`).value);
        const acidity = parseFloat(document.getElementById(`acidityInput${batchNumber}`).value);
        const sweetness = parseFloat(document.getElementById(`sweetnessInput${batchNumber}`).value);
        const aftertaste = parseFloat(document.getElementById(`aftertasteInput${batchNumber}`).value);
        const body = parseFloat(document.getElementById(`bodyInput${batchNumber}`).value);
        document.getElementById(`aromaticsSlider${batchNumber}`).value = aromatics;
        document.getElementById(`aciditySlider${batchNumber}`).value = acidity;
        document.getElementById(`sweetnessSlider${batchNumber}`).value = sweetness;
        document.getElementById(`aftertasteSlider${batchNumber}`).value = aftertaste;
        document.getElementById(`bodySlider${batchNumber}`).value = body;
        updateChart();
    }

    document.getElementById(`aromaticsSlider${batchNumber}`).addEventListener('input', updateChart);
    document.getElementById(`aciditySlider${batchNumber}`).addEventListener('input', updateChart);
    document.getElementById(`sweetnessSlider${batchNumber}`).addEventListener('input', updateChart);
    document.getElementById(`aftertasteSlider${batchNumber}`).addEventListener('input', updateChart);
    document.getElementById(`bodySlider${batchNumber}`).addEventListener('input', updateChart);
    document.getElementById(`aromaticsInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
    document.getElementById(`acidityInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
    document.getElementById(`sweetnessInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
    document.getElementById(`aftertasteInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
    document.getElementById(`bodyInput${batchNumber}`).addEventListener('input', updateSliderFromInput);
}
