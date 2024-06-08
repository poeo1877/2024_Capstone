package smartbrew.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import smartbrew.domain.Product;
import smartbrew.domain.Sale;
import smartbrew.domain.SalesDetail;
import smartbrew.repository.ProductRepository;
import smartbrew.repository.SaleRepository;
import smartbrew.repository.SalesDetailRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SalesDetailRepository salesDetailRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<smartbrew.service.SalesReportDTO> getSalesReport() {
        List<Sale> sales = saleRepository.findAll();

        return sales.stream().map(sale -> {
            SalesDetail salesDetail = sale.getSalesDetails().get(0);
            Product product = salesDetail.getProduct();
            int price = product.getPrice();
            int quantity = sale.getQuantitySold();
            BigDecimal revenue = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(quantity));
            BigDecimal commission = revenue.multiply(sale.getCommissionRate().divide(BigDecimal.valueOf(100)));
            BigDecimal settlementAmount = revenue.subtract(commission);

            return new smartbrew.service.SalesReportDTO(
                    sale.getChannel(),
                    sale.getCreatedAt(),
                    quantity,
                    price,
                    revenue.intValue(),
                    sale.getCommissionRate(),
                    commission,
                    settlementAmount,
                    product.getProductName()
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public Sale createSale(int quantity_sold, String channel, BigDecimal commissionRate, Long productId, String paymentMethod) {
        // Create a new sale
        Sale sale = new Sale();

        sale.setCreatedAt(sale.getCreatedAt());
        sale.setUpdatedAt(sale.getUpdatedAt());
        sale.setQuantitySold(quantity_sold);
        sale.setChannel(channel);
        sale.setCommissionRate(commissionRate);
        Sale savedSale = saleRepository.save(sale);

        // Get the product
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid product ID"));

        // Create a new sales detail
        SalesDetail salesDetail = new SalesDetail();
        salesDetail.setSale(savedSale);
        salesDetail.setProduct(product);
        salesDetail.setPaymentMethod(paymentMethod);
        salesDetail.setUpdatedAt(null);
        salesDetail.setDiscountYn(false); // assuming no discount for simplicity
        salesDetailRepository.save(salesDetail);

        return savedSale;
    }
}
