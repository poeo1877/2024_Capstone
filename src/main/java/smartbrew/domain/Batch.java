package smartbrew.domain;

import jakarta.annotation.sql.DataSourceDefinitions;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;
import java.util.List;

@NoArgsConstructor
@Data
@Entity
@Table(name = "batch")
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "start_time", nullable = false)
    private Timestamp startTime = new Timestamp(System.currentTimeMillis());

    @Column(name = "end_time")
    private Timestamp endTime;

    @Column(name = "recipe_ratio")
    private String recipeRatio = "1.0";

    @ManyToOne
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "fermenter_id")
    private Fermenter fermenter;

    @OneToMany(mappedBy = "batch")
    private List<SensorMeasurement> sensorMeasurements;

    public Batch(Long batchId) {
        this.batchId = batchId;
    }
}
