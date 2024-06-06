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
            print('Raw ADC Value: {:5d}, Voltage: {:5.3f}V'.format(raw_value,voltage))

        except Exception as e:
            print("Error reading ADC:", e)
        time.sleep(1)

except KeyboardInterrupt:
    print("Measurement stopped by user.")


