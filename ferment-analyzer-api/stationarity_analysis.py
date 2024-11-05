from statsmodels.tsa.stattools import adfuller

def check_stationarity(ts_data):
    """
    시계열 데이터의 정상성을 ADF 검정을 통해 확인합니다.
    Args:
        ts_data (pd.Series): 시계열 데이터
    Returns:
        dict: 정상성 검증 결과
    """
    result = adfuller(ts_data)
    adf_statistic = result[0]
    p_value = result[1]
    critical_values = result[4]
    is_stationary = p_value < 0.05  # p-value가 0.05 미만이면 정상성 만족

    return {
        "adf_statistic": adf_statistic,
        "p_value": p_value,
        "critical_values": critical_values,
        "is_stationary": is_stationary
    }
