package smartbrew.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import smartbrew.domain.ExcelGenerator;
import smartbrew.service.SaleService;
import smartbrew.dto.SalesReportDTO;

import java.io.ByteArrayInputStream;
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
}