$(document).ready(function() {
    // DataTables 초기화
    var table = $('#example').DataTable();

    // 기본 검색 기능을 커스터마이즈
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            // 검색창의 입력 값을 가져옴
            var searchTerm = $('#example_filter input').val().trim();

            // 띄어쓰기를 포함한 검색어로 검색 (그대로 하나의 문자열로 처리)
            var combinedData = data.join(' ').toLowerCase(); // 데이터 행을 문자열로 변환

            // 검색어가 데이터에 포함되어 있는지 확인
            if (combinedData.indexOf(searchTerm.toLowerCase()) !== -1) {
                return true;
            }
            return false;
        }
    );

    // 검색창 입력에 대한 실시간 반응
    $('#example_filter input').on('keyup', function() {
        table.draw();
    });
});



(function ($) {
	"use strict";
	//example 1
	var table = $("#example").DataTable({
		createdRow: function (row, data, index) {
			$(row).addClass("selected");
		},
		columnDefs: [
			{
				targets: 0, // 첫 번째 열을 타겟으로 설정
				visible: false, // 해당 열을 숨김
				searchable: false, // 해당 열을 검색에서 제외
			},
			{
				targets: [5], orderable: false // 특정 열의 정렬 비활성화
			},
		],
		autoWidth: false, // 테이블의 너비를 자동으로 조정하지 않음
	});

	table.on("click", "tbody tr", function (e) {
        // 체크박스 클릭 시, 행 이벤트 처리하지 않도록 함
        if ($(e.target).is('input[type="checkbox"]')) {
            return;
        }

        var $row = table.row(this).nodes().to$();
        var hasClass = $row.hasClass("selected");

        if (hasClass) {
            $row.removeClass("selected");
            $row.find('input[type="checkbox"]').prop("checked", false); // 체크박스 해제
        } else {
            $row.addClass("selected");
            $row.find('input[type="checkbox"]').prop("checked", true); // 체크박스 선택
        }

        var rowData = table.row(this).data();
        console.log("Selected row data:", rowData);
    });

    // 체크박스를 클릭했을 때도 행의 색상과 선택 상태를 변경
    table.on("click", "input[type='checkbox']", function (e) {
        e.stopPropagation(); // 행의 클릭 이벤트 방지

        var $row = $(this).closest('tr');
        var isChecked = $(this).prop("checked");

        if (isChecked) {
            $row.addClass("selected"); // 체크되면 행에 색상 적용
        } else {
            $row.removeClass("selected"); // 체크 해제되면 색상 제거
        }
    });

	table.rows().every(function () {
		this.nodes().to$().removeClass("selected");
	});

	$("#downloadExcel").on("click", function () {
		// 테이블 데이터를 JSON 형식으로 가져오기
		var tableData = table.rows({ search: "applied" }).data().toArray();

		// 서버로 요청 보내기
		$.ajax({
			url: "/download-excel",
			method: "POST",
			contentType: "application/json",
			data: JSON.stringify({ data: tableData }),
			success: function (response) {
				// 서버에서 응답으로 받은 파일을 다운로드
				var blob = new Blob([response], {
					type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				});
				var link = document.createElement("a");
				link.href = window.URL.createObjectURL(blob);
				link.download = "data.xlsx";
				link.click();
			},
			error: function (xhr, status, error) {
				console.error("Error downloading Excel file:", error);
			},
		});
	});

})(jQuery);
