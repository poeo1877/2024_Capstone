package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PressureSensorDTO {
    private Long dataId;
    private BigDecimal pressureUpper;
    private BigDecimal pressureLower;
    private Timestamp measuredTime;
    private Long batchId;
    private BigDecimal brix;
}
