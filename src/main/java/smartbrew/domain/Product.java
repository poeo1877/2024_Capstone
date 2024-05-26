package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String productName;
    private int price;
    private String category;

    @ManyToOne
    @JoinColumn(name = "lot_id", referencedColumnName = "lotId")
    private Lot lot;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp expirationDate;
    private Timestamp bottlingDate;
    private String notificationNumber;
    private String barcode;
}
