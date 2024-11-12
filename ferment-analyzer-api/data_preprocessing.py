import pandas as pd
import numpy as np

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
    # return df.resample(freq).asfreq()
    # 지정된 frequency로 재인덱싱하여 모든 시간대를 포함
    df = df.resample(freq).asfreq()
    df[relative_time_column] = df.index.total_seconds().astype(int)
    return df.reset_index(drop=True)


# # 이상치 제거 및 보간 함수 정의
# def find_parameters(df, column):
#     """
#     이상치 제거에 필요한 파라미터를 찾습니다.
    
#     Args:
#     df (pd.DataFrame): 처리할 데이터 프레임
#     column (str): 처리할 컬럼 이름

#     Returns:
#     tuple: 윈도우 크기와 임계값
#     """
#     window_size = max(1, len(df) // 10)
#     threshold = 1.25 * df[column].std()
#     return window_size, threshold

# def mark_outliers(df, column):
#     """
#     이상치를 마킹하고 해당 값을 None으로 설정합니다.
    
#     Args:
#     df (pd.DataFrame): 처리할 데이터 프레임
#     column (str): 처리할 컬럼 이름

#     Returns:
#     pd.DataFrame: 이상치를 마킹한 데이터 프레임
#     """
#     window_size, threshold = find_parameters(df, column)
#     rolling_mean = df[column].rolling(window=window_size, center=True).mean()
#     is_outlier = abs(df[column] - rolling_mean) > threshold
#     df[column] = df[column].where(~is_outlier)
#     return df


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
    # for col in columns:
    #     df = mark_outliers(df, col)
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
    # 손실된 행의 개수를 파악하고 채우기
    df = df.sort_values(by=relative_time_column).reset_index(drop=True)
    full_range = pd.DataFrame({relative_time_column: np.arange(df[relative_time_column].min(), df[relative_time_column].max() + 60, 60)})
    df = pd.merge(full_range, df, on=relative_time_column, how='left')
    df = clean_and_interpolate(df, columns)
    
     
    # NaN 값 처리
    if df[columns].isnull().values.any():
        print("Warning: NaN values found after preprocessing. Performing forward fill.")
        df[columns] = df[columns].ffill().bfill()  # Forward fill 수행
        df[columns] = df[columns].astype('float64')  # 적절한 dtype으로 변환
        
        if df[columns].isnull().values.any():
            raise ValueError("Processed data contains NaN values after cleaning and interpolation.")
    

    
    return df

# 사용 예시
# df는 sensor_measurement 테이블에서 데이터를 불러온 후 데이터 프레임으로 변환한 것
# df_processed = preprocess_data(df, relative_time_column='relative_time', columns=['in_temperature', 'out_temperature', 'pressure_upper'])
