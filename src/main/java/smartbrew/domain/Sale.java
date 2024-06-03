package smartbrew.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Data
@Entity
@Table(name = "sale")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sale_id")
    private Long saleId;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "quantity_sold", nullable = false)
    private int quantitySold;

    // 추가된 필드
    @Column(name = "channel", length = 50) // 문자열 길이 제한을 50으로 지정
    private String channel;

    // 추가된 필드
    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2) // 정확도 5와 스케일 2로 지정
    private BigDecimal commissionRate;

    @OneToMany(mappedBy = "sale", fetch = FetchType.LAZY)
    public List<SalesDetail> salesDetails;


}
