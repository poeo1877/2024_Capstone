document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded 이벤트 실행됨");
    function populateRecipeDetails() {
        const select = document.getElementById('recipeSelect');
        const selectedOption = select.options[select.selectedIndex];

        document.getElementById('recipeName').value =
            selectedOption.getAttribute('data-name') || '';
        document.getElementById('recipeInfo').value =
            selectedOption.getAttribute('data-info') || '';
        document.getElementById('productName').value =
            selectedOption.getAttribute('data-product') || '';
    }

    function populateFermenterDetails() {
        const select = document.getElementById('fermenterSelect');
        const selectedOption = select.options[select.selectedIndex];

        document.getElementById('fermentationSize').value =
            selectedOption.getAttribute('data-volume') || '';
        document.getElementById('fermentationName').value =
            selectedOption.getAttribute('data-line') || '';
    }

    // 레시피 선택 시 이벤트 연결
    document.getElementById('recipeSelect').addEventListener('change', populateRecipeDetails);

    // 발효조 선택 시 이벤트 연결
    document.getElementById('fermenterSelect').addEventListener('change', populateFermenterDetails);

    // 배치 생성 버튼 클릭 시 이벤트
    document.getElementById('createBatchButton').addEventListener('click', function () {
            event.preventDefault();  // 기본 폼 제출 방지
            
            const recipeSelect = document.getElementById('recipeSelect');
            const fermenterSelect = document.getElementById('fermenterSelect');

            const recipeId = recipeSelect.selectedIndex;
            const fermenterId = fermenterSelect.selectedIndex;
            console.log('Selected Recipe ID:', recipeId);
            console.log('Selected Fermenter ID:', fermenterId);

            let isValid = true;

            // 발효조 선택 상태 확인
            if (!fermenterId) {
                $('#fermenterSelect').css({
                    background: 'rgb(251, 227, 228)',
                    border: '1px solid #fbc2c4',
                    color: '#8a1f11',
                });
                isValid = false;
            }

            // 레시피 선택 상태 확인
            if (!recipeId) {
                $('#recipeSelect').css({
                    background: 'rgb(251, 227, 228)',
                    border: '1px solid #fbc2c4',
                    color: '#8a1f11',
                });
                isValid = false;
            }

            // Select 창 클릭 시 색깔 초기화
            $('#fermenterSelect, #recipeSelect').on('focus', function () {
                $(this).css({
                    background: '',
                    border: '',
                    color: '',
                });
            });

            if (!recipeId || !fermenterId) {
                alert('레시피와 발효조를 선택하세요.');
                return;
            }

            // 서버로 데이터 전송
            fetch('./create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipe_id: recipeId,
                    fermenter_id: fermenterId,
                }),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        alert('Batch created successfully');
                        window.location.href = '/dashboard';
                    } else {
                        alert('Error creating batch: ' + (data.error || 'Unknown error'));
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('An error occurred while creating the batch');
                });
        });


    // 발효조 추가 버튼 클릭 시 이벤트
    function submitFermenter() {
        const fermenterLine = document.getElementById('fermenterLineInput').value;
        const fermenterVolume = document.getElementById('fermenterVolumeInput').value;
    
        if (!fermenterLine || !fermenterVolume) {
            alert('발효조 라인과 크기를 입력하세요.');
            return;
        }
    
        fetch('/fermenter/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fermenter_line: fermenterLine,
                fermenter_volume: fermenterVolume,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert('발효조가 추가되었습니다.');
    
                // 발효조 선택 창에 새 발효조 추가
                const fermenterSelect = document.getElementById('fermenterSelect');
                const newOption = document.createElement('option');
                newOption.value = data.fermenter.id; 
                newOption.setAttribute('data-volume', data.fermenter.fermenter_volume);
                newOption.setAttribute('data-line', data.fermenter.fermenter_line);
                newOption.textContent = data.fermenter.fermenter_line;
    
                fermenterSelect.appendChild(newOption);
    
                // 모달 닫기 및 입력 필드 초기화
                $('#fermenterModal').modal('hide');
    
                // `fermenterForm` 요소가 존재하는지 확인
                const fermenterForm = document.getElementById('fermenterForm');
                if (fermenterForm) {
                    fermenterForm.reset();  // 폼이 존재할 경우에만 초기화
                } else {
                    console.error('fermenterForm not found.');
                }
            } else {
                alert('발효조 추가 중 오류 발생: ' + data.error);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('발효조 추가 중 오류가 발생했습니다.');
        });
    }
    
    

    // 글로벌 함수로 등록
    window.submitFermenter = submitFermenter;
});


// 전역에서 materialIndex 초기화
let materialIndex = 1;  // 필드 추가할 때 사용할 인덱스

// HTML 엔티티를 디코딩하는 함수
function decodeHtmlEntities(str) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
}

// HTML 엔티티를 디코딩하고 JSON 데이터를 가져오는 코드
const rawMaterialsText = document.getElementById('rawMaterialsData').textContent;
const decodedText = decodeHtmlEntities(rawMaterialsText);
const rawMaterials = JSON.parse(decodedText);

// 재료 추가 버튼에 이벤트 리스너 추가
document.getElementById("addMaterialButton").addEventListener("click", function () {
    const materialsContainer = document.getElementById('materials');

    // 새로운 필드를 추가
    const newMaterial = document.createElement('div');
    newMaterial.classList.add('form-group', 'form-row');
    newMaterial.id = `material-${materialIndex}`;

    // 옵션 HTML 생성
    const optionsHtml = rawMaterials.map(material => `
        <option value="${material.raw_material_id}">${material.raw_material_name}</option>
    `).join('');

    // 새 필드 HTML 작성 (name 속성 추가)
    newMaterial.innerHTML = `
        <div class="col">
            <label>재료</label>
            <select name="materials[${materialIndex}][raw_material_id]" id="materialSelect-${materialIndex}" class="form-control" required>
                <option value="">원료 선택...</option>
                ${optionsHtml}
            </select>
        </div>
        <div class="col">
            <label>사용량</label>
            <input type="number" class="form-control" id="materialQuantity-${materialIndex}" name="materials[${materialIndex}][quantity]" placeholder="사용량" min="1" required>
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger" style=" margin-top: 30px;" onclick="removeMaterial(${materialIndex})">X</button>
        </div>
    `;
    
    // 새로운 필드를 materials 컨테이너에 추가
    materialsContainer.appendChild(newMaterial);
    materialIndex++;  // 다음 필드를 위한 인덱스 증가
});


// 재료 삭제 함수
function removeMaterial(index) {
    const materialElement = document.getElementById(`material-${index}`);
    materialElement.remove();
}

document.getElementById("recipeForm").addEventListener("submit", function (event) {
    event.preventDefault();  // 폼의 기본 제출 동작을 막음

    const form = document.getElementById('recipeForm');
    const formData = new FormData(form);

    // AJAX 요청으로 서버에 데이터 전송
    fetch('/api/recipe/add', {
        method: 'POST',
        body: formData  // FormData로 폼 데이터 전송
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('레시피가 성공적으로 저장되었습니다.');
            // 필요하면 페이지를 새로고침하거나 다른 작업을 수행할 수 있음
            window.location.reload();  // 페이지 새로고침 (선택 사항)
        } else {
            alert('레시피 저장에 실패했습니다: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('오류가 발생했습니다.');
    });
});
