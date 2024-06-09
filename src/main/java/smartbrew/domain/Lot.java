package smartbrew.domain;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "lot")
public class Lot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lot_id")
    private Long lotId;

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(name = "lot_volume", nullable = false)
    private int lotVolume;
}