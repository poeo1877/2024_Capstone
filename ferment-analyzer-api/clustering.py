import pandas as pd
import numpy as np
from scipy.stats import skew, kurtosis
from hdbscan import HDBSCAN
import matplotlib.pyplot as plt
from sklearn.model_selection import ParameterSampler
import os
import matplotlib.ticker as ticker
import io

def resample_data(sensor_data, interval='10min'):
    return sensor_data.resample(interval).mean().dropna()

def chunk_data(sensor_data_resampled, interval_points):
    chunks = []
    for start in range(0, len(sensor_data_resampled), interval_points):
        chunk = sensor_data_resampled.iloc[start:start + interval_points]
        if len(chunk) < interval_points:
            chunk_interpolated = pd.DataFrame()
            for column in chunk.columns:
                x_original = np.arange(len(chunk))
                x_new = np.linspace(0, len(chunk) - 1, interval_points)
                interpolated_values = np.interp(x_new, x_original, chunk[column].values)
                chunk_interpolated[column] = interpolated_values
            chunks.append(chunk_interpolated)
        else:
            chunks.append(chunk)
    return chunks

def extract_basic_features(chunk):
    return {
        'mean': chunk.mean(),
        'std': chunk.std(),
        'min': chunk.min(),
        'max': chunk.max(),
        'skew': skew(chunk),
        'kurtosis': kurtosis(chunk)
    }

def extract_features(chunks, column):
    features_list = []
    for chunk in chunks:
        features = extract_basic_features(chunk[column])
        features_list.append(features)
    return pd.DataFrame(features_list)

def perform_clustering(features, param_grid):
    best_labels = None
    best_n_clusters = 0
    for params in ParameterSampler(param_grid, n_iter=10, random_state=42):
        clusterer = HDBSCAN(min_cluster_size=params['min_cluster_size'], min_samples=params['min_samples'])
        labels = clusterer.fit_predict(features)
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        if n_clusters > best_n_clusters:
            best_labels = labels
            best_n_clusters = n_clusters
    return best_labels, best_n_clusters

def plot_clustering_results(sensor_data_resampled, features, labels, interval_points, column, output_path):
    # label 설정
    if column == 'in_temperature':
        label_name = '온도'
    elif column == 'co2_concentration':
        label_name = '이산화탄소'
    else:
        label_name = column

    plt.figure(figsize=(15, 8))
    plt.plot(sensor_data_resampled.index, sensor_data_resampled[column], color='darkgray', linewidth=3.0, alpha=0.8, label=f'군집이 안되는 {label_name} 데이터')

    colors = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
        '#aec7e8', '#ffbb78', '#98df8a', '#ff9896', '#c5b0d5', '#c49c94', '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5'
    ]

    for cluster_label in set(labels):
        if cluster_label == -1:
            continue
        cluster_indices = features.index[labels == cluster_label]
        for idx in cluster_indices:
            start_idx = idx * interval_points
            end_idx = min((idx + 1) * interval_points, len(sensor_data_resampled))
            plt.plot(sensor_data_resampled.index[start_idx:end_idx], sensor_data_resampled[column].iloc[start_idx:end_idx],
                     color=colors[cluster_label % len(colors)], alpha=0.9, linewidth=4.0)

    # Adding vertical grid lines for each day
    plt.gca().xaxis.set_major_locator(ticker.MultipleLocator(1))  # Set major ticks at 1-day intervals
    plt.grid(axis='x', linestyle='-', linewidth=1.5, color='darkgrey', alpha=0.7)

    # Adding vertical lines for chunk boundaries
    for start in range(0, len(sensor_data_resampled), interval_points):
        plt.axvline(x=sensor_data_resampled.index[start], color='black', linestyle='--', linewidth=1.5, alpha=0.7)
    

    # relative_time_days = (sensor_data_resampled.index - sensor_data_resampled.index[0]).total_seconds() / (60 * 60 * 24)
    # plt.xticks(sensor_data_resampled.index[::interval_points], labels=[f'{int(day)}' for day in relative_time_days[::interval_points]])

    # xticks를 일 단위로 설정
    day_intervals = pd.date_range(start=sensor_data_resampled.index[0], end=sensor_data_resampled.index[-1], freq='D')
    plt.xticks(day_intervals, labels=[f'{(day - sensor_data_resampled.index[0]).days}일' for day in day_intervals])
    plt.xlim(sensor_data_resampled.index[0], sensor_data_resampled.index[-1])

    # title 설정
    plt.xlabel('상대 시간(일)')
    plt.ylabel(label_name)
    plt.title(f'{label_name} 유사 패턴 군집화 결과 (동일 색상은 같은 군집)')
    plt.legend(loc='upper right')


    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='svg')
    plt.clf()  # Clear the figure for the next plot
    img_stream.seek(0)
    svg_clustring= img_stream.getvalue().decode("utf-8")

    return svg_clustring