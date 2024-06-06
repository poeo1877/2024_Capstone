
import time
import board
import adafruit_mprls
import requests
import json

def read_pressure():
    try:
        i2c = board.I2C()  # I2C 버스 인스턴스 생성
        mpr = adafruit_mprls.MPRLS(i2c, psi_min=0, psi_max=25)  # 압력 센서 인[>
        return mpr.pressure  # 압력 값을 반환
    except Exception as e:
        print("Error reading pressure:", e)
        return None

def update_pressure(pressure):
    try:
        url = 'http://192.168.8.127:8080/sensor/press/update'
        data = {'pressureUpper': pressure, 'batchId':10}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, data=json.dumps(data), headers=headers)
        print("Response:", response.text)
    except Exception as e:
        print("Error updating pressure:", e)

if __name__ == '__main__':
    pressure = read_pressure()  # 압력 읽기
    if pressure is not None:
        print("Pressure:", pressure)
        update_pressure(pressure)  # 압력 업데이트
    else:
        print("Failed to read pressure value.")
