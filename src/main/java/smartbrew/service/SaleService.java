package smartbrew.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smartbrew.domain.Product;
import smartbrew.domain.Sale;
import smartbrew.domain.SalesDetail;
import smartbrew.dto.SalesReportDTO;
import smartbrew.repository.SaleRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;

    @Transactional(readOnly = true)
    public List<SalesReportDTO> getSalesReport() {
        List<Sale> sales = saleRepository.findAll();

        return sales.stream().map(sale -> {
            SalesDetail salesDetail = sale.getSalesDetails().get(0); // 가정: 하나의 Sale에 하나의 SalesDetail만 있음
            Product product = salesDetail.getProduct();
            int price = product.getPrice();
            int quantity = sale.getQuantitySold();
            BigDecimal revenue = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(quantity)); // int -> BigDecimal 변환
            BigDecimal commission = revenue.multiply(sale.getCommissionRate().divide(BigDecimal.valueOf(100)));
            BigDecimal settlementAmount = revenue.subtract(commission);

            return new SalesReportDTO(
                    sale.getChannel(),
                    sale.getCreatedAt(),
                    quantity,
                    price,
                    revenue.intValue(), // DTO가 int를 요구한다면, BigDecimal을 int로 변환
                    sale.getCommissionRate(),
                    commission,
                    settlementAmount,
                    product.getProductName()
            );
        }).collect(Collectors.toList());
    }
}
