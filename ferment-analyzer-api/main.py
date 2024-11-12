from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import seaborn as sns
import pandas as pd
import os
from typing import List
# from prophet import Prophet

import pickle



from database import get_batch_data, connect_to_db, disconnect_from_db, database
# from stationarity_analysis import check_stationarity
# from trend_analysis import decompose_seasonality
from data_preprocessing import preprocess_data
from chart import save_histograms, save_volatility_analysis, save_change_point_detection
from clustering import resample_data, chunk_data, extract_features, perform_clustering, plot_clustering_results

import matplotlib
matplotlib.use('Agg') 
import matplotlib.pyplot as plt

app = FastAPI()

# 한글 폰트 설정
plt.rc("font", family = "Malgun Gothic")
sns.set(font="Malgun Gothic", 
rc={"axes.unicode_minus":False}, style='white')

plt.rcParams["font.size"] = 14  # 기본 폰트 크기 설정
plt.rcParams["axes.titlesize"] = 18  # 제목 폰트 크기 설정
plt.rcParams["axes.labelsize"] = 16  # 축 레이블 폰트 크기 설정
plt.rcParams["xtick.labelsize"] = 14  # x축 틱 라벨 폰트 크기 설정
plt.rcParams["ytick.labelsize"] = 14  # y축 틱 라벨 폰트 크기 설정
plt.rcParams["legend.fontsize"] = 14  # 범례 폰트 크기 설정

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BatchRequest(BaseModel):
    batch_id: int
    
@app.on_event("startup")
async def startup():
    await connect_to_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_from_db()


@app.get("/")
async def root():
    return {"message": "FastAPI server is running"}




# Define a request model
class BatchRequest(BaseModel):
    batch_id: int

@app.post("/analyze")
async def analyze_batch(request: BatchRequest):
    batch_id = request.batch_id
    output_dir = os.getcwd()

    try:
        # Fetch the data
        try:
            df = await get_batch_data(batch_id)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        if df.empty:
            raise HTTPException(status_code=404, detail="No data found for the given batch_id")


        histograms = save_histograms(df, output_dir, batch_id)

        # 데이터 전처리
        try:
            # df = preprocess_data(df, relative_time_column='relative_time', columns=['in_temperature', 'co2_concentration'])
            df = preprocess_data(df, relative_time_column='relative_time', columns=['in_temperature', 'co2_concentration'])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during data preprocessing: {str(e)}")
        

        # Generate the charts and get the SVG paths in JSON format
        
        volatility_analysis = save_volatility_analysis(df, output_dir, batch_id)
        change_point_detection = save_change_point_detection(df, output_dir, batch_id)

        df['measured_time'] = pd.to_datetime(df['measured_time'])
        df.set_index('measured_time', inplace=True)
        
        # 클러스터링에 사용하기 전에 결측값을 제거
        features = df[['in_temperature', 'co2_concentration']]  # 클러스터링에 사용할 열 선택
        features = features.dropna()  # 결측값이 있는 행 제거
        
        sensor_data_resampled = resample_data(features)
        interval_points = 12 * 60 // 10  # 12시간에 해당하는 포인트 수 (10분 간격)
        chunks = chunk_data(sensor_data_resampled, interval_points)

        temperature_features = extract_features(chunks, 'in_temperature')
        co2_features = extract_features(chunks, 'co2_concentration')

        param_grid = {
            'min_cluster_size': [2, 5, 10, 15],
            'min_samples': [1, 5, 10]
        }

        best_temperature_labels, best_temperature_n_clusters = perform_clustering(temperature_features, param_grid)
        best_co2_labels, best_co2_n_clusters = perform_clustering(co2_features, param_grid)

        svg_temp_clustring = plot_clustering_results(sensor_data_resampled, temperature_features, best_temperature_labels, interval_points, 'in_temperature', os.path.join(os.getcwd(), f'temperature_clustering_{batch_id}.svg'))
        svg_co2_clustring = plot_clustering_results(sensor_data_resampled, co2_features, best_co2_labels, interval_points, 'co2_concentration', os.path.join(os.getcwd(), f'co2_clustering_{batch_id}.svg'))

        clustring = [svg_temp_clustring , svg_co2_clustring]
        
        # Combine results into a JSON structure
        result = {
            "histograms": histograms,
            "volatility_analysis": volatility_analysis,
            "change_point_detection": change_point_detection,
            "clustring": clustring
        }



    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing the batch: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=404, detail="No data found for the given batch_id")

    return result



# 모델 로드
with open("./best_rf_model.pkl", "rb") as f:
    model = pickle.load(f)

class CO2PredictionRequest(BaseModel):
    out_temperature: float
    pressure_upper: float
    relative_time: float
    volume: float

@app.post("/predict_co2")
async def predict_co2(data: CO2PredictionRequest):
    
    features = pd.DataFrame([[data.out_temperature, data.pressure_upper, data.volume, data.relative_time]])
    
    # 예측 수행
    try:
        co2_concentration = model.predict(features)[0]
        return {"co2_concentration": co2_concentration}
    except Exception as e:
        # 에러 메시지 출력
        return {"error": str(e)}
