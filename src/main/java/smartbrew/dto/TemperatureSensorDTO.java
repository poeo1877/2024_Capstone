package smartbrew.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class TemperatureSensorDTO {
    private Long dataId;
    private BigDecimal outTemperature;
    private BigDecimal inTemperature;
    private Timestamp measuredTime;
    private Long batchId;
}
