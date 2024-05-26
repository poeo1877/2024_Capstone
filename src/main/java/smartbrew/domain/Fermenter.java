package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Fermenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fermenterId;

    private int fermenterVolume;

    @Enumerated(EnumType.STRING)
    private FermentationStatus status = FermentationStatus.대기;

    private String fermenterLine;

    public enum FermentationStatus {
        대기, 발효중, 완료, 오류
    }
}