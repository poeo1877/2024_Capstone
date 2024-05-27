package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;


@Data
@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "price")
    private int price;

    @Column(name = "category")
    private String category;

    @ManyToOne
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "expiration_date")
    private Timestamp expirationDate;

    @Column(name = "bottling_date")
    private Timestamp bottlingDate;

    @Column(name = "notification_number")
    private String notificationNumber;

    @Column(name = "barcode")
    private String barcode;
}
