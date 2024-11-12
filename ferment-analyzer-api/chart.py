from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import os
import io
import seaborn as sns
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import ruptures as rpt
import base64

app = FastAPI()


# Save histograms for both temperature and CO2 concentration
def save_histograms(df, output_dir, batch_id):
    # Prepare the plot for In Temperature
    in_temperature = df['in_temperature']
    co2_concentration = df['co2_concentration']

    # Plotting histogram for In Temperature
    plt.figure(figsize=(15, 8))
    bins_temp = 30
    bin_width_temp = (in_temperature.max() - in_temperature.min()) / bins_temp
    sns.histplot(in_temperature, bins=bins_temp, kde=False, color='#4BC0C0', label='In Temperature', alpha=0.5, edgecolor='black')
    plt.xlabel('온도 값')
    plt.ylabel('빈도수')
    plt.title('온도 히스토그램')
    plt.xlim(in_temperature.min(), in_temperature.max())  # Remove padding from x-axis
    plt.text(float(in_temperature.max()) - (float(in_temperature.max()) - float(in_temperature.min())) * 0.01, plt.ylim()[1] * 0.975, f'막대 1칸 간격: {bin_width_temp:.2f}', fontsize=12, color='black', ha='right', va='top', bbox=dict(boxstyle='square,pad=0.3', edgecolor='lightgrey', facecolor='white'))

    # Save to a BytesIO object for temperature
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_temp = img_stream.getvalue().decode("utf-8")

    # Plotting histogram for CO2 Concentration
    plt.figure(figsize=(15, 8))
    bins_co2 = 30
    bin_width_co2 = (co2_concentration.max() - co2_concentration.min()) / bins_co2
    sns.histplot(co2_concentration, bins=bins_co2, kde=False, color='#FF6384', label='CO2 Concentration', alpha=0.5, edgecolor='black')
    plt.xlabel('이산화탄소 농도 값')
    plt.ylabel('빈도수')
    plt.title('이산화탄소 히스토그램')
    plt.xlim(co2_concentration.min(), co2_concentration.max())  # Remove padding from x-axis
    plt.text(float(co2_concentration.max()) - (float(co2_concentration.max()) - float(co2_concentration.min())) * 0.01, plt.ylim()[1] * 0.975, f'막대 1칸 간격: {bin_width_co2:.2e}', fontsize=12, color='black', ha='right', va='top', bbox=dict(boxstyle='square,pad=0.3', edgecolor='lightgrey', facecolor='white'))

    # Save to a BytesIO object for CO2 concentration
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_co2 = img_stream.getvalue().decode("utf-8")

    return [svg_temp, svg_co2]

# Save volatility analysis for both temperature and CO2 concentration
def save_volatility_analysis(df, output_dir, batch_id):
    # Prepare the plot for In Temperature Volatility
    time = df['relative_time'] / (60 * 60 * 24)
    in_temperature = df['in_temperature']
    co2_concentration = df['co2_concentration']

    # Calculate rolling standard deviation for volatility
    window_size = 10  # 10 mins window assuming data is measured every minute
    in_temp_volatility = in_temperature.rolling(window=window_size).std()
    co2_volatility = co2_concentration.rolling(window=window_size).std()

    # High volatility threshold
    volatility_threshold_temp = in_temp_volatility.quantile(0.95)
    volatility_threshold_co2 = co2_volatility.quantile(0.95)

    # Plotting In Temperature Volatility
    plt.figure(figsize=(15, 8))
    plt.plot(time, in_temp_volatility, label='온도 변동성', color='#4BC0C0')
    plt.axhline(y=volatility_threshold_temp, color='black', linestyle='--', label='높은 변동성 기준선 (95 백분위수)')
    plt.xlabel('상대 시간(일)')
    plt.ylabel('변동성 (이동 표준편차)')
    plt.title('온도 변동성 분석')
    plt.legend(loc='upper right')
    plt.gca().xaxis.set_major_locator(ticker.MultipleLocator(1))
    plt.grid(axis='x', linestyle='-', linewidth=1, color='darkgrey', alpha=0.7)
    plt.xlim(time.min(), time.max())  # Remove padding from x-axis

    # Save to a BytesIO object for temperature volatility
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_temp_volatility = img_stream.getvalue().decode("utf-8")

    # Plotting CO2 Concentration Volatility
    plt.figure(figsize=(15, 8))
    plt.plot(time, co2_volatility, label='이산화탄소 변동성', color='#FF6384')
    plt.axhline(y=volatility_threshold_co2, color='black', linestyle='--', label='높은 변동성 기준선 (95 백분위수)')
    plt.xlabel('상대 시간(일)')
    plt.ylabel('변동성 (이동 표준편차)')
    plt.title('이산화탄소 변동성 분석')
    plt.legend(loc='upper right')
    plt.gca().xaxis.set_major_locator(ticker.MultipleLocator(1))
    plt.grid(axis='x', linestyle='-', linewidth=1, color='darkgrey', alpha=0.7)
    plt.xlim(time.min(), time.max())  # Remove padding from x-axis

    # Save to a BytesIO object for CO2 volatility
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_co2_volatility = img_stream.getvalue().decode("utf-8")

    return [svg_temp_volatility, svg_co2_volatility]

# Save change point detection for both temperature and CO2 concentration
def save_change_point_detection(df, output_dir, batch_id):
    # Prepare the plot for Change Point Detection for both Temperature and CO2
    time = df['relative_time'] / (60 * 60 * 24)
    in_temperature = df['in_temperature']
    co2_concentration = df['co2_concentration']

    # Calculating 10-minute moving average to smooth the data
    window_size_moving_avg = 10  # 10-minute window assuming data is measured every minute
    smoothed_temperature = in_temperature.rolling(window=window_size_moving_avg).mean()
    smoothed_co2 = co2_concentration.rolling(window=window_size_moving_avg).mean()

    # Drop NaN values from rolling mean calculation
    smoothed_temperature = smoothed_temperature.dropna()
    smoothed_co2 = smoothed_co2.dropna()

    signal_temperature = smoothed_temperature.values
    signal_co2 = smoothed_co2.values

    # Detecting change points for Temperature
    algo_temperature = rpt.KernelCPD(kernel="linear", min_size=30, jump=5).fit(signal_temperature)
    breakpoints_temperature = algo_temperature.predict(n_bkps=5)

    # Detecting change points for CO2
    algo_co2 = rpt.KernelCPD(kernel="linear", min_size=30, jump=5).fit(signal_co2)
    breakpoints_co2 = algo_co2.predict(n_bkps=5)

    # Plotting Change Point Detection for Temperature
    plt.figure(figsize=(15, 8))
    plt.plot(time[-len(smoothed_temperature):], signal_temperature, label="온도 변동점 탐지 (10분 이동 평균선)", color='#4BC0C0', linewidth=3.0, alpha=0.8)
    for bp in breakpoints_temperature:
        if bp < len(signal_temperature):
            plt.axvline(x=time.iloc[bp + (len(time) - len(smoothed_temperature))], color='black', linestyle='--', linewidth=1.5, alpha=0.7)

    plt.xlabel('상대 시간(일)')
    plt.ylabel("온도 값")
    plt.title("평활화된 온도 데이터의 변동성 탐지")
    plt.gca().xaxis.set_major_locator(ticker.MultipleLocator(1))
    plt.grid(axis='x', linestyle='-', linewidth=1.5, color='darkgrey', alpha=0.7)
    plt.xlim(time.iloc[-len(smoothed_temperature)], time.iloc[-1])  # Focus on the time range of the smoothed data

    # Save to a BytesIO object for temperature change points
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_temp_change_points = img_stream.getvalue().decode("utf-8")

    # Plotting Change Point Detection for CO2
    plt.figure(figsize=(15, 8))
    plt.plot(time[-len(smoothed_co2):], signal_co2, label="이산화탄소 변동점 탐지 (10분 이동 평균선)", color='#FF6384', linewidth=3.0, alpha=0.8)
    for bp in breakpoints_co2:
        if bp < len(signal_co2):
            plt.axvline(x=time.iloc[bp + (len(time) - len(smoothed_co2))], color='black', linestyle='--', linewidth=1.5, alpha=0.7)

    plt.xlabel('상대 시간(일)')
    plt.ylabel("이산화탄소 농도")
    plt.title("평활화된 이산화탄소 데이터의 변동성 탐지")
    plt.gca().xaxis.set_major_locator(ticker.MultipleLocator(1))
    plt.grid(axis='x', linestyle='-', linewidth=1.5, color='darkgrey', alpha=0.7)
    plt.xlim(time.iloc[-len(smoothed_co2)], time.iloc[-1])  # Focus on the time range of the smoothed data

    # Save to a BytesIO object for CO2 change points
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_co2_change_points = img_stream.getvalue().decode("utf-8")

    return [svg_temp_change_points, svg_co2_change_points]

