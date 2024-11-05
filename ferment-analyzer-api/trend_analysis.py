from statsmodels.tsa.seasonal import seasonal_decompose
import matplotlib.pyplot as plt

def decompose_seasonality(series, period):
    decomposition = seasonal_decompose(series, model='additive', period=period)

    # 시각화
    fig, (ax1, ax2, ax3, ax4) = plt.subplots(4, 1, figsize=(12, 8), sharex=True)
    ax1.set_title("Seasonal Decomposition of In Temperature")
    ax1.plot(series, label='Original')
    ax1.legend(loc='upper left')

    ax2.plot(decomposition.trend, label='Trend', color='orange')
    ax2.legend(loc='upper left')

    ax3.plot(decomposition.seasonal, label='Seasonal', color='green')
    ax3.legend(loc='upper left')

    ax4.plot(decomposition.resid, label='Residual', color='red')
    ax4.legend(loc='upper left')

    plt.tight_layout()
    plt.show()

    # 결과 반환
    result = {
        "trend": decomposition.trend.dropna().to_dict(),
        "seasonal": decomposition.seasonal.dropna().to_dict(),
        "residual": decomposition.resid.dropna().to_dict(),
    }
    return result
