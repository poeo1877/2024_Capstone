package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
public class LotHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lotHistoryId;

    private String notes;
    private String lotLocation;

    @ManyToOne
    @JoinColumn(name = "lot_id", referencedColumnName = "lotId")
    private Lot lot;

    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());
    private Timestamp updatedAt;
}
