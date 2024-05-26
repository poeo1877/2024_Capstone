package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Entity
@Data
public class SensorMeasurement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dataId;

    private Integer co2Concentration;
    private BigDecimal brix;
    private Timestamp measuredTime;
    private BigDecimal outTemperature;
    private BigDecimal inTemperature;
    private BigDecimal ph;
    private BigDecimal pressureUpper;
    private BigDecimal pressureLower;

    @ManyToOne
    @JoinColumn(name = "batch_id", referencedColumnName = "batchId")
    private Batch batch;
}
