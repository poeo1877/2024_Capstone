package smartbrew.dto;

import lombok.Data;

import java.sql.Timestamp;

@Data
public class Co2SensorDTO {
    private Long dataId;
    private Integer co2Concentration;
    private Timestamp measuredTime;
    private Long batchId;
}
