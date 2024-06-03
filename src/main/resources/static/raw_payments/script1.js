document.addEventListener('DOMContentLoaded', function() {
    var addMaterialModal = document.getElementById("addMaterialModal");
    var addMaterialBtn = document.getElementById("addMaterialBtn");
    var closeAddMaterialModal = document.getElementsByClassName("close")[0];

    var startModal = document.getElementById("startModal");
    var startBtn = document.getElementById("start-button");
    var closeStartModal = document.getElementsByClassName("close1")[0];

    addMaterialBtn.onclick = function() {
        addMaterialModal.style.display = "block";
    }

    closeAddMaterialModal.onclick = function() {
        addMaterialModal.style.display = "none";
    }

    startBtn.onclick = function() {
        startModal.style.display = "block";
        fetchMaterialData();
    }

    closeStartModal.onclick = function() {
        startModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === addMaterialModal) {
            addMaterialModal.style.display = "none";
        } else if (event.target === startModal) {
            startModal.style.display = "none";
        }
    }

    document.getElementById("addMaterialForm").onsubmit = function(event) {
        event.preventDefault();

        var formData = new FormData(event.target);
        var materialData = {
            rawMaterialName: formData.get("materialName"),
            category: formData.get("category"),
            description: formData.get("productName"),
            unit: formData.get("unit"),
            supplierName: formData.get("supplierName"),
            phoneNumber: formData.get("phoneNumber"),
            zipCode: formData.get("zipCode")
        };
        console.log(materialData);
        fetch('/api/materials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(materialData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        addMaterialModal.style.display = "none";
        event.target.reset();
    }

    function fetchMaterialData() {
        fetch('/api/materials')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                var tableBody = document.querySelector("#rawmaterialTable tbody");
                tableBody.innerHTML = ""; // 기존 데이터 초기화

                data.forEach(material => {
                    var row = document.createElement("tr");

                    Object.values(material).forEach(value => {
                        var cell = document.createElement("td");
                        cell.textContent = value;
                        row.appendChild(cell);
                    });
                    const now = new Date();
                    const date = now.toISOString().split('T')[0].replace(/-/g, '');
                    // "선택" 버튼 추가
                    var selectBtn = document.createElement("button");
                    selectBtn.textContent = "선택";
                    selectBtn.onclick = function() {
                        // 선택된 원료의 데이터를 가져옵니다.
                        var selectedMaterialData = {
                            date: date || "", // 날짜 데이터가 없으므로, 빈 문자열 또는 적절한 값으로 설정
                            rawMaterialName: material.rawMaterialName || "", // 원료명
                            productName: material.description || "", // 제품명
                            supplierName: material.supplierName || "", // 공급업체명
                            unit: material.unit || "", // 단위
                            quantityReceived: "", // 입고량 데이터가 없으므로, 빈 문자열 또는 적절한 값으로 설정
                            quantityUsed: "", // 사용량 데이터가 없으므로, 빈 문자열 또는 적절한 값으로 설정
                            currentStock: "", // 당일재고량 데이터가 없으므로, 빈 문자열 또는 적절한 값으로 설정
                            remarks: "" // 비고 데이터가 없으므로, 빈 문자열 또는 적절한 값으로 설정
                        };

                        // materialTable에 새로운 행으로 추가합니다.
                        var materialTableBody = document.querySelector("#materialTable tbody");
                        var newRow = materialTableBody.insertRow();

                        Object.values(selectedMaterialData).forEach((value, index) => {
                            var cell = newRow.insertCell(index);
                            cell.textContent = value;
                        });

                        // 모달을 닫습니다.
                        startModal.style.display = "none";
                    };

                    var actionCell = document.createElement("td");
                    actionCell.appendChild(selectBtn);
                    row.appendChild(actionCell);

                    tableBody.appendChild(row);
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

});