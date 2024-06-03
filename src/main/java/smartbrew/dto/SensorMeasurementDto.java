package smartbrew.dto;

import java.math.BigDecimal;

public class SensorMeasurementDto {
    private BigDecimal inTemperature;
    private BigDecimal outTemperature;

    public SensorMeasurementDto(BigDecimal inTemperature, BigDecimal outTemperature) {
        this.inTemperature = inTemperature;
        this.outTemperature = outTemperature;
    }

    public BigDecimal getInTemperature() {
        return inTemperature;
    }

    public void setInTemperature(BigDecimal inTemperature) {
        this.inTemperature = inTemperature;
    }

    public BigDecimal getOutTemperature() {
        return outTemperature;
    }

    public void setOutTemperature(BigDecimal outTemperature) {
        this.outTemperature = outTemperature;
    }
}

