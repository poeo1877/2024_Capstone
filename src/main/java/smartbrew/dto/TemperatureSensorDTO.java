package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TemperatureSensorDTO {
    private Long dataId;
    private BigDecimal outTemperature;
    private BigDecimal inTemperature;
    private Timestamp measuredTime;
    private Long batchId;
}
