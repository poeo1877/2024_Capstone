import board
import busio
import adafruit_mprls
import requests
import json
from decimal import Decimal

# I2C-0 버스 초기화 (GPIO 0과 GPIO 1 사용)
i2c_0 = busio.I2C(1, 0)  # GPIO 1 (SCL)과 GPIO 0 (SDA)를 사용

# I2C-0 버스에 연결된 MPRLS 센서 초기화
mprls_0 = adafruit_mprls.MPRLS(i2c_0)

# I2C-0 센서에서 압력 데이터 읽기
pressure_0 = '{:.5f}'.format(Decimal(str(mprls_0.pressure)))

# I2C-1 버스 초기화 (기본 SCL, SDA 사용)
i2c_1 = busio.I2C(board.SCL, board.SDA)

# I2C-1 버스에 연결된 MPRLS 센서 초기화
mprls_1 = adafruit_mprls.MPRLS(i2c_1)

# I2C-1 센서에서 압력 데이터 읽기
pressure_1 = '{:.5f}'.format(Decimal(str(mprls_1.pressure)))

if __name__ == '__main__':
    print(pressure_0, pressure_1)
    url = 'http://192.168.27.127:8080/sensor/press/update'
    data = {'pressureUpper': pressure_0, 'pressureLower': pressure_1}
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, data=json.dumps(data), headers=headers)
