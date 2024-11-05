import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import periodogram

def spectral_analysis(series, fs=1):
    freqs, power = periodogram(series, fs=fs)

    # 시각화
    plt.figure(figsize=(10, 6))
    plt.plot(freqs, power)
    plt.title("Spectral Analysis")
    plt.xlabel("Frequency")
    plt.ylabel("Power")
    plt.grid(True)
    plt.show()
