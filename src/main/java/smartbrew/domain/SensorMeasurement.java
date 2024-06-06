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
    @Column(name = "data_id")
    private Long dataId;

    @Column(name = "co2_concentration")
    private Integer co2Concentration;

    @Column(name = "brix")
    private BigDecimal brix;

    @Column(name = "measured_time")
    private Timestamp measuredTime;

    @Column(name = "out_temperature")
    private BigDecimal outTemperature;

    @Column(name = "in_temperature")
    private BigDecimal inTemperature;

    @Column(name = "ph")
    private BigDecimal ph;

    @Column(name = "pressure_upper")
    private BigDecimal pressureUpper;

    @Column(name = "pressure_lower")
    private BigDecimal pressureLower;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

}
