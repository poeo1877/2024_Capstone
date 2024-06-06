package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "tasting_note")
public class TastingNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tasting_note_id")
    private Long tastingNoteId;

    @Column(name = "fermentation_aroma", nullable = false)
    private BigDecimal fermentationAroma;

    @Column(name = "foam", nullable = false)
    private BigDecimal foam;

    @Column(name = "mouthfeel", nullable = false)
    private BigDecimal mouthfeel;

    @Column(name = "balance", nullable = false)
    private BigDecimal balance;

    @Column(name = "clarity", nullable = false)
    private BigDecimal clarity;

    @Column(name = "sweetness", nullable = false)
    private BigDecimal sweetness;

    @Column(name = "acidity", nullable = false)
    private BigDecimal acidity;

    @Column(name = "body", nullable = false)
    private BigDecimal body;

    @Column(name = "grainy_aroma", nullable = false)
    private BigDecimal grainyAroma;

    @Column(name = "finish")
    private BigDecimal finish;

    @Column(name = "evaluator_name", nullable = false)
    private String evaluatorName;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt;
}

