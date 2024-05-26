package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
public class RawMaterialReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long receiptId;

    private BigDecimal quantity;
    private int unitPrice;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", referencedColumnName = "rawMaterialId")
    private RawMaterial rawMaterial;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt;
}
