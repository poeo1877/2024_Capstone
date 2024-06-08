package smartbrew.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import smartbrew.service.BatchService;
import smartbrew.service.SensorMeasurementService;
import smartbrew.domain.ExcelGenerator;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/batch")
public class BatchController {

    private final BatchService batchService;
    private final SensorMeasurementService sensorMeasurementService;
    private static final Logger logger = LoggerFactory.getLogger(BatchController.class);

    public BatchController(BatchService batchService, SensorMeasurementService sensorMeasurementService) {
        this.batchService = batchService;
        this.sensorMeasurementService = sensorMeasurementService;
    }

    @GetMapping("/completed")
    public ResponseEntity<List<productDTO>> getCompletedBatch(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            validateDates(startDate, endDate);

            Timestamp startTimestamp = Timestamp.valueOf(startDate);
            Timestamp endTimestamp = Timestamp.valueOf(endDate);

            List<SensorMeasurement> sensorMeasurements = sensorMeasurementService.findSensorMeasurementsWithinDateRange(startTimestamp, endTimestamp);
            if (sensorMeasurements.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            List<productDTO> productDTOs = sensorMeasurements.stream()
                    .map(sensorMeasurement -> {
                        productDTO dto = new productDTO();
                        dto.setComplete_time(sensorMeasurement.getMeasuredTime());

                        Batch batch = sensorMeasurement.getBatch();
                        dto.setBatch_id(sensorMeasurement.getMeasuredTime().toLocalDateTime().toString() + "-" + batch.getBatchId() + "-" + batch.getFermenter().getFermenterLine());
                        dto.setProduct_name(batch.getRecipe().getProductName());
                        dto.setInTemperature_average(sensorMeasurement.getInTemperature() != null ? sensorMeasurement.getInTemperature() : BigDecimal.ZERO);
                        dto.setOutTemperature_average(sensorMeasurement.getOutTemperature() != null ? sensorMeasurement.getOutTemperature() : BigDecimal.ZERO);

                        return dto;
                    }).collect(Collectors.toList());

            for (int i = 0; i < productDTOs.size(); i++) {
                productDTOs.get(i).setId(i + 1);
            }

            return new ResponseEntity<>(productDTOs, HttpStatus.OK);
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: ", e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
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
            validateDates(startDate, endDate);

            Timestamp startTimestamp = Timestamp.valueOf(startDate);
            Timestamp endTimestamp = Timestamp.valueOf(endDate);

            List<SensorMeasurement> sensorMeasurements = sensorMeasurementService.findSensorMeasurementsWithinDateRange(startTimestamp, endTimestamp);
            if (sensorMeasurements.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            List<productDTO> productDTOs = sensorMeasurements.stream()
                    .map(sensorMeasurement -> {
                        productDTO dto = new productDTO();
                        dto.setComplete_time(sensorMeasurement.getMeasuredTime());

                        Batch batch = sensorMeasurement.getBatch();
                        dto.setBatch_id(sensorMeasurement.getMeasuredTime().toLocalDateTime().toString() + "-" + batch.getBatchId() + "-" + batch.getFermenter().getFermenterLine());
                        dto.setProduct_name(batch.getRecipe().getProductName());
                        dto.setInTemperature_average(sensorMeasurement.getInTemperature() != null ? sensorMeasurement.getInTemperature() : BigDecimal.ZERO);
                        dto.setOutTemperature_average(sensorMeasurement.getOutTemperature() != null ? sensorMeasurement.getOutTemperature() : BigDecimal.ZERO);

                        return dto;
                    }).collect(Collectors.toList());

            for (int i = 0; i < productDTOs.size(); i++) {
                productDTOs.get(i).setId(i + 1);
            }

            ByteArrayInputStream in = ExcelGenerator.productsToExcel(productDTOs);
            byte[] bytes = in.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=completed_batches.xlsx");
            headers.add("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return ResponseEntity.ok().headers(headers).body(bytes);

        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: ", e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error generating Excel file: ", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null || endDate == null) {
            throw new DateTimeParseException("Invalid date format", "", 0);
        }
        if (endDate.isBefore(startDate)) {
            throw new DateTimeParseException("End date must be after start date", "", 0);
        }
    }
}
