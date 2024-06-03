package smartbrew.service;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.sql.Timestamp;

@Data
@AllArgsConstructor
public class SalesReportDTO {

    private String channel;
    private Timestamp createdAt;
    private int quantitySold;
    private int price;
    private int revenue;
    private BigDecimal commissionRate;
    private BigDecimal commission;
    private BigDecimal settlementAmount;
    private String productName;
}
