package smartbrew.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
public class PhSensorDTO {
    private Long dataId;
    private BigDecimal ph;
    private Timestamp measuredTime;
    private Long batchId;
}
