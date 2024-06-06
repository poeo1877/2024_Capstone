import serial
import time
import requests
import json

def read_co2():
    ser = serial.Serial('/dev/ttyAMA0', baudrate=9600, timeout=1)
    time.sleep(2)  # 센서 초기화를 위한 대기 시간

    while True:
        ser.write(b"\xFF\x01\x86\x00\x00\x00\x00\x00\x79")
        time.sleep(0.1)  # 응답을 기다리기 위한 대기 시간
        response = ser.read(9)
        if len(response) == 9:
            high_level = response[2]
            low_level = response[3]
            co2 = (high_level * 8) + low_level
            print(f"{co2}")
            return co2
        else:
            print("Error reading CO2 data")
            read_co2()

if __name__ == '__main__':
    co2 = read_co2()
    if co2 is not None:
        url = 'http://192.168.8.127:8080/sensor/co2/update'
        data = {'co2': co2}
        headers = {'Content-Type': 'application/json'}
        response = requests.post(url, data=json.dumps(data), headers=headers)
        print(response.text)
    else:
        print("Failed to read CO2 data")

