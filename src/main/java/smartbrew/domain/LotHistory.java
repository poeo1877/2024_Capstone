package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "lot_history")
public class LotHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Added id column as primary key

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @ManyToOne
    @JoinColumn(name = "lot_id")
    private Lot lot;

    @Column(name = "notes")
    private String notes;

    @Column(name = "lot_location", length = 50)
    private String lotLocation;
}
