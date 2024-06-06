package smartbrew.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class PressureSensorDTO {
    private Long dataId;
    private BigDecimal pressureUpper;
    private BigDecimal pressureLower;
    private Timestamp measuredTime;
    private Long batchId;
    private BigDecimal brix;
}
