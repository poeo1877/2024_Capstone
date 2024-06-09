import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

# Create the I2C bus
i2c = busio.I2C(board.SCL, board.SDA)

# Create the ADC object using the I2C bus
ads = ADS.ADS1115(i2c)

# Create single-ended input on channel 0
chan = AnalogIn(ads, ADS.P0)
try:
    while True:
        try:
            # Read the raw ADC value
            raw_value = chan.value
            # Convert raw value to voltage (optional)
            voltage = chan.voltage
            # Print the raw value and voltage
            V1 = 0.59502  # pH 4에서의 전압
            pH1 = 2.6
            V2 = 1.25541  # pH 7에서의 전압
            pH2 = 7.1

            m = (V2 - V1) / (pH2 - pH1)
            b = V1 - (m * pH1)

            ph = (voltage - b)/m

            print("Ph: {:.2f}, Voltage: {:.5f}V".format(ph, voltage))
        except Exception as e:
            print("Error reading ADC:", e)
        time.sleep(1)

except KeyboardInterrupt:
    print("Measurement stopped by user.")
