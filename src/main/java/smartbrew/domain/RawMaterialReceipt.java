// RawMaterialReceipt.java
package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@Entity
@Table(name = "raw_material_receipt")
public class RawMaterialReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "receipt_id")
    private Long receiptId;

    @Column(name = "quantity", nullable = false)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false)
    private int unitPrice;

    @ManyToOne
    @JoinColumn(name = "raw_material_id", referencedColumnName = "raw_material_id")
    private RawMaterial rawMaterial;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    public RawMaterialReceipt(BigDecimal quantity, int unitPrice, RawMaterial rawMaterial) {
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.rawMaterial = rawMaterial;
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }

    public RawMaterialReceipt() {
        this.createdAt = new Timestamp(System.currentTimeMillis());
    }
}
