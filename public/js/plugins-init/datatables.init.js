

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
		],
		autoWidth: false, // 테이블의 너비를 자동으로 조정하지 않음
	});

	table.on("click", "tbody tr", function () {
		var $row = table.row(this).nodes().to$();
		var hasClass = $row.hasClass("selected");
		if (hasClass) {
			$row.removeClass("selected");
		} else {
			$row.addClass("selected");
		}

		/**
		 * 선택된 행의 모든 열 값을 콘솔로 출력.
		 * data_id 값이 잘 선택되는지 확인하는 용도
		 */
		var rowData = table.row(this).data();
		console.log("Selected row data:", rowData);
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
