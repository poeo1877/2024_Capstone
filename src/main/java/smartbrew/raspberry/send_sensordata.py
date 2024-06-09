import os
import glob
from datetime import datetime, timedelta, timezone
import time
import requests
import json
import serial
import board
import busio
import adafruit_mprls
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn
from decimal import Decimal

os.system('modprobe w1-gpio')
os.system('modprobe w1-therm')

base_dir = '/sys/bus/w1/devices/'
device_folder = glob.glob(base_dir + '28*')[0]
device_file = device_folder + '/w1_slave'

def read_temp_raw():
    f = open(device_file, 'r')
    lines = f.readlines()
    f.close()
    return lines

def read_temp():
    lines = read_temp_raw()
    while lines[0].strip()[-3:] != 'YES':
        time.sleep(0.2)
        lines = read_temp_raw()
    equals_pos = lines[1].find('t=')
    if (equals_pos != -1):
        temp_string = lines[1][equals_pos+2:]
        temp_c = float(temp_string) / 1000.0
        temp_f = temp_c * 9.0 / 5.0 + 32.0
        return temp_c

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
            return co2

# I2C-0 버스 초기화 (GPIO 0과 GPIO 1 사용)
i2c_0 = busio.I2C(1, 0)  # GPIO 1 (SCL)과 GPIO 0 (SDA)를 사용

# I2C-0 버스에 연결된 MPRLS 센서 초기화
mprls_0 = adafruit_mprls.MPRLS(i2c_0)

# I2C-0 센서에서 압력 데이터 읽기
pressure_0 = '{:.5f}'.format(Decimal(str(mprls_0.pressure)))

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1115(i2c)

# Create single-ended input on channel 0
chan = AnalogIn(ads, ADS.P0)
# Read the raw ADC value

raw_value = chan.value
voltage = chan.voltage
# Print the raw value and voltage
V1 = 0.59502  # pH 4에서의 전압
pH1 = 2.6
V2 = 1.25541  # pH 7에서의 전압
pH2 = 7.1

m = (V2 - V1) / (pH2 - pH1)
b = V1 - (m * pH1)

ph = (voltage - b)/m

if __name__ == '__main__':
    temp = read_temp()
    co2 = read_co2()
    pressureUpper = pressure_0
    ph = '{:.2f}'.format(ph)
    korea_timezone = timezone(timedelta(hours=9))
    current_korea_time = current_utc_time.astimezone(korea_timezone)
    current_time_iso = current_korea_time.isoformat(timespec='milliseconds')
    url = 'http://192.168.27.127:8080/sensor/update'
    data = {'inTemperature': temp, 'co2Concentration': co2, 'pressureUpper': pressureUpper, 'ph': ph, 'measuredTime':current_time_iso}
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(response)