package smartbrew.domain;


import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "raw_material_usage")
public class RawMaterialUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long usageId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityUsed;

    @ManyToOne
    @JoinColumn(name = "rawMaterialId")
    private RawMaterial rawMaterial;

    @ManyToOne
    @JoinColumn(name = "batchId")
    private Batch batch;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

}