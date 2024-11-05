import pandas as pd


### co2 데이터 replace용 함수 ###
R = 8.314  # J/(mol·K), 이상 기체 상수
V = 0.000366588  # m^3로 변환


# 몰질량 상수 및 부피 설정
M_CO2 = 44.01  # CO₂의 몰질량 (g/mol)
V_l = 0.000366588  # L 단위 부피 (몰질량 계산용)
R_l = 22.414  # STP에서 1몰의 기체가 차지하는 부피 (L/mol)

# 기존 방식의 몰질량 계산 함수 정의
def calculate_molar_mass(ppm, volume=V_l, molar_volume=R_l, molar_mass=M_CO2):
    mol = (ppm * volume) / (10**6 * molar_volume)
    return mol * molar_mass

#################################


# 중복된 시간 제거 (평균으로 집계)
def remove_duplicates(df, time_column):
    """
    특정 시간 컬럼을 기준으로 중복된 시간 데이터를 평균으로 집계하여 제거합니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    time_column (str): 중복된 시간을 제거할 컬럼 이름

    Returns:
    pd.DataFrame: 중복된 시간을 제거한 데이터 프레임
    """
    return df.groupby(time_column).mean().reset_index()

# 상대 시간을 사용하여 재인덱싱
def reindex_time(df, relative_time_column, freq='1min'):
    """
    상대 시간을 사용하여 데이터 프레임을 재인덱싱하고 모든 시간대를 포함시킵니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    relative_time_column (str): 상대 시간을 나타내는 컬럼 이름
    freq (str): 재인덱싱할 시간 간격

    Returns:
    pd.DataFrame: 재인덱싱된 데이터 프레임
    """
    # 상대 시간을 timedelta로 변환하여 인덱스로 설정
    df['relative_time_index'] = pd.to_timedelta(df[relative_time_column], unit='s')
    df.set_index('relative_time_index', inplace=True)

    # 지정된 frequency로 재인덱싱하여 모든 시간대를 포함
    return df.resample(freq).asfreq()


# 이상치 제거 및 보간 함수 정의
def find_parameters(df, column):
    """
    이상치 제거에 필요한 파라미터를 찾습니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    column (str): 처리할 컬럼 이름

    Returns:
    tuple: 윈도우 크기와 임계값
    """
    window_size = max(1, len(df) // 10)
    threshold = 1.25 * df[column].std()
    return window_size, threshold

def mark_outliers(df, column):
    """
    이상치를 마킹하고 해당 값을 None으로 설정합니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    column (str): 처리할 컬럼 이름

    Returns:
    pd.DataFrame: 이상치를 마킹한 데이터 프레임
    """
    window_size, threshold = find_parameters(df, column)
    rolling_mean = df[column].rolling(window=window_size, center=True).mean()
    is_outlier = abs(df[column] - rolling_mean) > threshold
    df[column] = df[column].where(~is_outlier)
    return df


# 각 열에 대해 이상치 마킹 및 보간 수행
def clean_and_interpolate(df, columns):
    """
    지정된 열에 대해 이상치를 제거하고 보간을 수행합니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    columns (list): 처리할 컬럼 목록

    Returns:
    pd.DataFrame: 이상치가 처리되고 보간된 데이터 프레임
    """
    for col in columns:
        df = mark_outliers(df, col)
    for col in columns:
        df[col] = df[col].infer_objects(copy=False).interpolate(method='linear')
    return df

# 전체 데이터 전처리 함수
def preprocess_data(df, relative_time_column, columns):
    """
    전체 데이터 전처리 과정을 실행합니다.
    
    Args:
    df (pd.DataFrame): 처리할 데이터 프레임
    relative_time_column (str): 상대 시간을 나타내는 컬럼 이름
    columns (list): 전처리할 컬럼 목록

    Returns:
    pd.DataFrame: 전처리된 데이터 프레임
    """
    df = remove_duplicates(df, relative_time_column)
    df = reindex_time(df, relative_time_column)
    df = clean_and_interpolate(df, columns)
    
    # NaN 값 제거 또는 처리 단계 추가
    if df.isnull().values.any():
        print("Warning: NaN values found after preprocessing. Performing forward fill.")
        df = df.fillna(method='ffill').fillna(method='bfill')  # Forward fill 후 backward fill 수행

    ### co2 값 replace ###
    # 이상기체 방정식을 이용한 몰질량 계산
    df["co2_concentration"] = (df["pressure_upper"] * V) / (R * (df["in_temperature"] + 273.15)) * M_CO2
    ######################
    
    
    # DataFrame을 CSV 파일로 저장
    df.to_csv('preprocessed_data.csv', index=False)
    print("DataFrame saved to preprocessed_data.csv")
    
    return df

# 사용 예시
# df는 sensor_measurement 테이블에서 데이터를 불러온 후 데이터 프레임으로 변환한 것
# df_processed = preprocess_data(df, relative_time_column='relative_time', columns=['in_temperature', 'out_temperature', 'pressure_upper'])
