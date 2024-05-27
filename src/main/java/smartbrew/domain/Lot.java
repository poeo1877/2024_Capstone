package smartbrew.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Lot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer lotId;
    private String productName;
    private Integer batchId;
    private Integer lotVolume;

    // 기본 생성자
    public Lot() {

    }

}
