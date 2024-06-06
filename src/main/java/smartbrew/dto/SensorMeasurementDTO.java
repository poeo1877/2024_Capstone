package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorMeasurementDTO {
    private BigDecimal outTemperature;
    private BigDecimal inTemperature;
    private BigDecimal pressureUpper;
    private BigDecimal pressureLower;
    private Integer co2Concentration;
    private BigDecimal ph;
    private Timestamp measuredTime;
    private Long batchId;
}
