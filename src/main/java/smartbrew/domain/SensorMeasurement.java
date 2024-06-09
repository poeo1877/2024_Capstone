package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "sensor_measurement")
public class SensorMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dataId;

    @Column(name = "co2_concentration")
    private Integer co2Concentration;

    @Column(name = "brix", precision = 5, scale = 3)
    private BigDecimal brix;

    @Column(name = "measured_time")
    private Timestamp measuredTime;

    @Column(name = "out_temperature", precision = 5, scale = 3)
    private BigDecimal outTemperature;

    @Column(name = "in_temperature", precision = 5, scale = 3)
    private BigDecimal inTemperature;

    @Column(name = "ph", precision = 4, scale = 2)
    private BigDecimal ph;

    @Column(name = "pressure_upper", precision = 10, scale = 4)
    private BigDecimal pressureUpper;

    @Column(name = "pressure_lower", precision = 10, scale = 4)
    private BigDecimal pressureLower;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
}
