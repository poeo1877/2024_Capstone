package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "fermenter")
public class Fermenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fermenter_id")
    private Long fermenterId;

    @Column(name = "fermenter_volume", nullable = false)
    private int fermenterVolume;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FermentationStatus status = FermentationStatus.WAITING;

//    @Enumerated(EnumType.STRING)  // Use EnumType.STRING to store the enum as a string
//    @Column(name = "status", nullable = false)
//    private String status = FermentationStatus.WAITING.toString();  // Store as string

    @Column(name = "fermenter_line")
    private String fermenterLine;
}