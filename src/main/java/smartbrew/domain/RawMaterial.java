// RawMaterial.java
package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "raw_material")
public class RawMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "raw_material_id")
    private Long rawMaterialId;

    @Column(name = "raw_material_name", nullable = false, length = 100)
    private String rawMaterialName;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "description")
    private String description;

    @Column(name = "unit", nullable = false, length = 10)
    private String unit;

    @Column(name = "supplier_name", length = 100)
    private String supplierName;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "zip_code", length = 6)
    private String zipCode;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "raw_material_use")
    private BigDecimal rawMaterialUse;

    @Column(name = "today_stock")
    private BigDecimal todayStock;

    @PrePersist
    protected void onCreate() {
        createdAt = Timestamp.valueOf(LocalDateTime.now());
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Timestamp.valueOf(LocalDateTime.now());
    }
}
