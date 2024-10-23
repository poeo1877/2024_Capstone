function updateChangeValue(
    selector,
    diff,
    percentage,
    iconSelector,
    percentSelector,
) {
    const valueElement = $(selector);
    const changeIcon = $(iconSelector);

    if (diff !== null) {
        valueElement.text(diff);
        // 아이콘 및 색상 설정
        if (diff > 0) {
            changeIcon.removeClass('fa-caret-down').addClass('fa-caret-up');
            changeIcon.css('color', 'red'); // 상승 시 빨간색
            valueElement.css('color', 'red'); // 변화량 상승 시 빨간색
            $(percentSelector).css('color', 'red'); // 퍼센트 상승 시 빨간색
        } else if (diff < 0) {
            changeIcon.removeClass('fa-caret-up').addClass('fa-caret-down');
            changeIcon.css('color', 'blue'); // 하락 시 파란색
            valueElement.css('color', 'blue'); // 변화량 하락 시 파란색
            $(percentSelector).css('color', 'blue'); // 퍼센트 하락 시 파란색
        } else {
            changeIcon.removeClass('fa-caret-up fa-caret-down'); // 변화 없음
            changeIcon.css('color', 'black'); // 변화 없음
            valueElement.css('color', 'black'); // 변화 없음
            $(percentSelector).css('color', 'black'); // 변화 없음
        }

        // 퍼센트 표시
        $(percentSelector).text(percentage + '%');
    } else {
        valueElement.text('N/A'); // 이전 데이터가 없을 경우
        changeIcon.removeClass('fa-caret-up fa-caret-down'); // 변화 없음
        $(percentSelector).text('N/A'); // 이전 데이터가 없을 경우
    }
}
