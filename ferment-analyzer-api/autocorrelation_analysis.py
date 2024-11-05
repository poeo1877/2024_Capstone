import matplotlib.pyplot as plt
from statsmodels.graphics.tsaplots import plot_acf, plot_pacf

def autocorrelation_analysis(series, lags=40):
    fig, ax = plt.subplots(2, 1, figsize=(12, 8))
    
    # 자기상관 그래프
    plot_acf(series, lags=lags, ax=ax[0])
    ax[0].set_title("Autocorrelation Function")
    
    # 부분 자기상관 그래프
    plot_pacf(series, lags=lags, ax=ax[1])
    ax[1].set_title("Partial Autocorrelation Function")
    
    plt.tight_layout()
    plt.show()
