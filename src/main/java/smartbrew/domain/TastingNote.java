package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
public class TastingNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tastingNoteId;

    private BigDecimal fermentationAroma;
    private BigDecimal foam;
    private BigDecimal mouthfeel;
    private BigDecimal balance;
    private BigDecimal clarity;
    private BigDecimal sweetness;
    private BigDecimal acidity;
    private BigDecimal body;
    private BigDecimal grainyAroma;
    private BigDecimal finish;
    private String evaluatorName;

    @ManyToOne
    @JoinColumn(name = "batch_id", referencedColumnName = "batchId")
    private Batch batch;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt;
}

