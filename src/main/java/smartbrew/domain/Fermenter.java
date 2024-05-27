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
    private FermentationStatus status = FermentationStatus.대기;

    @Column(name = "fermenter_line")
    private String fermenterLine;

    public enum FermentationStatus {
        대기, 발효중, 완료, 오류
    }
}