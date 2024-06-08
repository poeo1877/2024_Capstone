package smartbrew.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import smartbrew.domain.ExcelGenerator;
import smartbrew.domain.Product;
import smartbrew.domain.Sale;
import smartbrew.domain.SalesDetail;
import smartbrew.service.SaleService;
import smartbrew.service.SalesReportDTO;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @GetMapping("/report")
    public List<SalesReportDTO> getSalesReport() {
        return saleService.getSalesReport();
    }

    @GetMapping("/report/excel")
    public ResponseEntity<byte[]> getSalesReportAsExcel() {
        List<SalesReportDTO> salesReport = saleService.getSalesReport();
        ByteArrayInputStream excelStream = ExcelGenerator.salesReportToExcel(salesReport);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "sales_report.xlsx");

        byte[] excelBytes = excelStream.readAllBytes();
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }

    @PostMapping("/create")
    public ResponseEntity<SalesReportDTO> createSale(@RequestParam int quantity_sold,
                                                     @RequestParam String channel,
                                                     @RequestParam BigDecimal commissionRate,
                                                     @RequestParam Long productId,
                                                     @RequestParam String paymentMethod) {
        Sale sale = saleService.createSale(quantity_sold, channel, commissionRate, productId, paymentMethod);
        // Assuming there is a method to convert Sale to SalesReportDTO for the response
        SalesReportDTO salesReportDTO = convertToDTO(sale);
        return ResponseEntity.ok(salesReportDTO);
    }

    private SalesReportDTO convertToDTO(Sale sale) {
        SalesDetail salesDetail = sale.getSalesDetails().get(0);
        Product product = salesDetail.getProduct();
        int price = product.getPrice();
        int quantity = sale.getQuantitySold();
        BigDecimal revenue = BigDecimal.valueOf(price).multiply(BigDecimal.valueOf(quantity));
        BigDecimal commission = revenue.multiply(sale.getCommissionRate().divide(BigDecimal.valueOf(100)));
        BigDecimal settlementAmount = revenue.subtract(commission);

        return new SalesReportDTO(
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
    }
}
