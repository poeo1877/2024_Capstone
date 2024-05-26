package smartbrew.domain;


import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
public class RawMaterialUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usageId;

    private BigDecimal quantityUsed;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", referencedColumnName = "rawMaterialId")
    private RawMaterial rawMaterial;

    @ManyToOne
    @JoinColumn(name = "batch_id", referencedColumnName = "batchId")
    private Batch batch;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt;
}
