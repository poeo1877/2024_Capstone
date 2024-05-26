package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
public class RawMaterial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rawMaterialId;

    private String rawMaterialName;
    private String category;
    private String description;
    private String unit;
    private String supplierName;
    private String phoneNumber;
    private String zipCode;

    private Timestamp createdAt =  new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt;
}
