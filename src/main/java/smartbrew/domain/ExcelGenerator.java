package smartbrew.domain;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.dto.productDTO;
import smartbrew.service.SalesReportDTO;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

public class ExcelGenerator {

    public static ByteArrayInputStream productsToExcel(List<productDTO> products) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Complete Time", "Product Name", "Batch ID", "In Temperature Average", "Out Temperature Average"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(getHeaderCellStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            for (productDTO product : products) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(product.getId());
                row.createCell(1).setCellValue(product.getComplete_time().toString());
                row.createCell(2).setCellValue(product.getProduct_name());
                row.createCell(3).setCellValue(product.getBatch_id());
                row.createCell(4).setCellValue(product.getInTemperature_average().doubleValue());
                row.createCell(5).setCellValue(product.getOutTemperature_average().doubleValue());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create Excel file: " + e.getMessage());
        }
    }

    private static CellStyle getHeaderCellStyle(Workbook workbook) {
        CellStyle cellStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        cellStyle.setFont(font);
        return cellStyle;
    }

    public static ByteArrayInputStream rawMaterialsToExcel(List<RawMaterialDTO> rawMaterials) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Raw Materials");

            // 헤더 행
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Date", "Name", "Description", "Supplier", "Unit", "Stock", "Use", "Today Stock"};
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
                cell.setCellStyle(createHeaderCellStyle(workbook));
            }

            // 데이터 행
            int rowIdx = 1;
            for (RawMaterialDTO rawMaterial : rawMaterials) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rawMaterial.getRawMaterialId());
                row.createCell(1).setCellValue(rawMaterial.getDate().toString());
                row.createCell(2).setCellValue(rawMaterial.getRawMaterialName());
                row.createCell(3).setCellValue(rawMaterial.getRawMaterialDescription());
                row.createCell(4).setCellValue(rawMaterial.getSupplierName());
                row.createCell(5).setCellValue(rawMaterial.getRawMaterialUnit());
                row.createCell(6).setCellValue(rawMaterial.getRawMaterialStock().doubleValue());
                row.createCell(7).setCellValue(rawMaterial.getRawMaterialUse().doubleValue());
                row.createCell(8).setCellValue(rawMaterial.getTodayStock().doubleValue());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("엑셀 파일 생성 실패: " + e.getMessage());
        }
}
    private static CellStyle createHeaderCellStyle(Workbook workbook) {
        CellStyle headerCellStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerCellStyle.setFont(font);
        return headerCellStyle;
    }

    public static ByteArrayInputStream salesReportToExcel(List<SalesReportDTO> salesReport) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Sales Report");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"Channel", "Created At", "Quantity Sold", "Price", "Revenue", "Commission Rate", "Commission", "Settlement Amount", "Product Name"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(getHeaderCellStyle(workbook));
            }

            // Data
            int rowIdx = 1;
            for (SalesReportDTO sales : salesReport) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(sales.getChannel());
                row.createCell(1).setCellValue(sales.getCreatedAt().toString());
                row.createCell(2).setCellValue(sales.getQuantitySold());
                row.createCell(3).setCellValue(sales.getPrice());
                row.createCell(4).setCellValue(sales.getRevenue());
                row.createCell(5).setCellValue(sales.getCommissionRate().doubleValue());
                row.createCell(6).setCellValue(sales.getCommission().doubleValue());
                row.createCell(7).setCellValue(sales.getSettlementAmount().doubleValue());
                row.createCell(8).setCellValue(sales.getProductName());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create Excel file: " + e.getMessage());
        }
    }


}