
// 입고 모달
document.getElementById("materialNameSelect").addEventListener("change", function () {
  var materialSelect = document.getElementById("materialNameSelect");
  var newMaterialInput = document.getElementById("newMaterialName");
  var categoryGroup = document.getElementById("categoryGroup");
  var unitGroup = document.getElementById("unitGroup");
  var unitLabel = document.getElementById("unitLabel");  // 단위 표시 부분

  if (materialSelect.value === "new") {
    newMaterialInput.style.display = "block";
    categoryGroup.style.display = "block";
    unitGroup.style.display = "block";
    unitLabel.textContent = "단위 없음"; // 새 원료 추가 시 기본 단위 표시
  } else {
    newMaterialInput.style.display = "none";
    categoryGroup.style.display = "none";
    unitGroup.style.display = "none";

    fetch(`/api/material/unit?name=${materialSelect.value}`)
      .then(response => response.json())
      .then(data => {
        if (data.unit) {
          unitLabel.textContent = data.unit;  // 단위 표시
        } else {
          unitLabel.textContent = "단위 없음";
        }
      });
  }
});

document.getElementById("unit").addEventListener("input", function () {
  var unitValue = document.getElementById("unit").value;
  var unitLabel = document.getElementById("unitLabel");

  // 입력한 단위 값을 실시간으로 수량 필드 옆에 표시
  unitLabel.textContent = unitValue || "단위 없음";
});

document.getElementById("saveMaterialButton").addEventListener("click", function () {
  var selectedMaterial = document.getElementById("materialNameSelect").value;
  var newMaterialName = document.getElementById("newMaterialName").value;
  var category = document.getElementById("category").value;
  var unit = document.getElementById("unit").value;
  var quantity = document.getElementById("quantity").value;
  var unitPrice = document.getElementById("unitPrice").value;
  var description = document.getElementById("description").value;

  var materialName = selectedMaterial === "new" ? newMaterialName : selectedMaterial;

  //필드 유효성 검사
  if (selectedMaterial === "new") {
    // 새 원료를 추가하는 경우 모든 필드가 필요
    if (!materialName || !category || !unit || !quantity || !unitPrice || !description) {
      alert("모든 필드를 입력해주세요.");
      return; // 필드가 비어있으면 저장을 중단
    }
  } else {
    // 기존 원료를 선택한 경우 카테고리와 단위, 비고는 검사하지 않음
    if (!materialName || !quantity || !unitPrice) {
      alert("모든 필드를 입력해주세요.");
      return; // 필드가 비어있으면 저장을 중단
    }
  }

  // 서버로 데이터 전송 (AJAX 또는 Fetch API 사용)
  fetch("/api/material/receipt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      materialName: materialName,
      category: selectedMaterial === "new" ? category : null,
      unit: selectedMaterial === "new" ? unit : null,
      quantity: quantity,
      unitPrice: unitPrice,
      description: description
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("입고 데이터가 저장되었습니다.");
      location.reload(); // 페이지 새로고침
    } else {
      alert("입고 데이터 저장에 실패했습니다.");
    }
  });
});

// 출고모달

document.getElementById("materialNameSelectUsage").addEventListener("change", function () {
  var materialSelect = document.getElementById("materialNameSelectUsage");
  var unitLabelUsage = document.getElementById("unitLabelUsage");  // 단위 표시 부분

  // 선택된 원료의 단위를 서버에서 가져와서 설정
  fetch(`/api/material/unit?name=${materialSelect.value}`)
    .then(response => response.json())
    .then(data => {
      if (data.unit) {
        unitLabelUsage.textContent = data.unit;  // 선택한 원료의 단위 표시
      } else {
        unitLabelUsage.textContent = "단위 없음";
      }
    });
});

document.getElementById("saveUsageButton").addEventListener("click", function () {
  var selectedMaterial = document.getElementById("materialNameSelectUsage").value;
  var quantityUsage = document.getElementById("quantityUsage").value;
  var batchId = document.getElementById("batchId").value;
  var description = document.getElementById("usagedescription").value;

  // 필수 필드 유효성 검사
  if (!selectedMaterial || !quantityUsage) {
    alert("모든 필드를 입력해주세요.");
    return; // 필드가 비어있으면 저장을 중단
  }

  // 서버로 데이터 전송 (AJAX 또는 Fetch API 사용)
  fetch("/api/material/usage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      materialName: selectedMaterial,
      quantity: quantityUsage,
      batchId: batchId || null,
      description,
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("출고 데이터가 저장되었습니다.");
      location.reload(); // 페이지 새로고침
    } else {
      alert("출고 데이터 저장에 실패했습니다.");
    }
  });
});

// 재고변경모달
document.getElementById("materialNameSelectInventory").addEventListener("change", function () {
  var materialSelect = document.getElementById("materialNameSelectInventory");
  var todayStock = document.getElementById("todayStock");
  var unitInventory = document.getElementById("unitInventory");

  // 선택된 원료의 재고 및 단위 정보를 가져와서 표시
  fetch(`/api/material/inventory?name=${materialSelect.value}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        todayStock.value = data.today_stock;
        unitInventory.value = data.unit;
      } else {
        todayStock.value = "재고 정보 없음";
        unitInventory.value = "단위 없음";
      }
    });
});

document.getElementById("saveInventoryButton").addEventListener("click", function () {
  var selectedMaterial = document.getElementById("materialNameSelectInventory").value;
  var newInventory = document.getElementById("newInventory").value;
  // 필수 필드 유효성 검사
  if (!selectedMaterial || !newInventory) {
    alert("모든 필드를 입력해주세요.");
    return; // 필드가 비어있으면 저장을 중단
  }


  // 서버로 데이터 전송 (AJAX 또는 Fetch API 사용)
  fetch("/api/material/inventory", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      materialName: selectedMaterial,
      newInventory: newInventory,
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert("재고가 성공적으로 변경되었습니다.");
      location.reload(); // 페이지 새로고침
    } else {
      alert("재고 변경에 실패했습니다.");
    }
  });
});
