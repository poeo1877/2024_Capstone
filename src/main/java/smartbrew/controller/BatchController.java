package smartbrew.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.productDTO;
import smartbrew.domain.ExcelGenerator;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/batch")
public class BatchController {




































    @GetMapping("/completed")
    public ResponseEntity<List<productDTO>> getCompletedBatch(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Timestamp startTimestamp = Timestamp.valueOf(startDate);
            Timestamp endTimestamp = Timestamp.valueOf(endDate);

            List<SensorMeasurement> sensorMeasurements = sensorMeasurementServiceA.findSensorMeasurementsWithinDateRange(startTimestamp, endTimestamp);
            if (sensorMeasurements.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            List<productDTO> productDTOs = sensorMeasurements.stream()
                    .map(sensorMeasurement -> {
                        productDTO dto = new productDTO();
                        dto.setComplete_time(sensorMeasurement.getMeasuredTime());

                        // Finding Batch Details
                        Batch batch = sensorMeasurement.getBatch();
                        dto.setBatch_id(sensorMeasurement.getMeasuredTime().toLocalDateTime().toString() + "-" + batch.getBatchId() + "-" + batch.getFermenter().getFermenterLine());
                        dto.setProduct_name(batch.getRecipe().getProductName());

                        // Setting Temperature Data
                        dto.setInTemperature_average(sensorMeasurement.getInTemperature() != null ? sensorMeasurement.getInTemperature() : BigDecimal.ZERO);
                        dto.setOutTemperature_average(sensorMeasurement.getOutTemperature() != null ? sensorMeasurement.getOutTemperature() : BigDecimal.ZERO);

                        return dto;
                    }).collect(Collectors.toList());

            // Assigning IDs
            for (int i = 0; i < productDTOs.size(); i++) {
                productDTOs.get(i).setId(i + 1);
            }

            return new ResponseEntity<>(productDTOs, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error retrieving completed batches: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/completed/excel")
    public ResponseEntity<byte[]> downloadCompletedBatchExcel(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            Timestamp startTimestamp = Timestamp.valueOf(startDate);
            Timestamp endTimestamp = Timestamp.valueOf(endDate);

            List<SensorMeasurement> sensorMeasurements = sensorMeasurementServiceA.findSensorMeasurementsWithinDateRange(startTimestamp, endTimestamp);
            if (sensorMeasurements.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            List<productDTO> productDTOs = sensorMeasurements.stream()
                    .map(sensorMeasurement -> {
                        productDTO dto = new productDTO();
                        dto.setComplete_time(sensorMeasurement.getMeasuredTime());

                        // Finding Batch Details
                        Batch batch = sensorMeasurement.getBatch();
                        dto.setBatch_id(sensorMeasurement.getMeasuredTime().toLocalDateTime().toString() + "-" + batch.getBatchId() + "-" + batch.getFermenter().getFermenterLine());
                        dto.setProduct_name(batch.getRecipe().getProductName());

                        // Setting Temperature Data
                        dto.setInTemperature_average(sensorMeasurement.getInTemperature() != null ? sensorMeasurement.getInTemperature() : BigDecimal.ZERO);
                        dto.setOutTemperature_average(sensorMeasurement.getOutTemperature() != null ? sensorMeasurement.getOutTemperature() : BigDecimal.ZERO);

                        return dto;
                    }).collect(Collectors.toList());

            // Assigning IDs
            for (int i = 0; i < productDTOs.size(); i++) {
                productDTOs.get(i).setId(i + 1);
            }

            ByteArrayInputStream in = ExcelGenerator.productsToExcel(productDTOs);
            byte[] bytes = in.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=completed_batches.xlsx");
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return ResponseEntity
                    .ok()
                    .headers(headers)
                    .body(bytes);

        } catch (Exception e) {
            logger.error("Error generating Excel file: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
