package smartbrew.controller;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.dto.SensorMeasurementDTO;
import smartbrew.service.SensorMeasurementService;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sensor")
public class SensorMeasurementController {
    @Autowired
    private Logger logger;

    @Autowired
    private SensorMeasurementService sensorMeasurementService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;


    @PostMapping("/measurement")
    public ResponseEntity<String> saveMeasurement(@RequestBody SensorMeasurementDTO dto) {
        /* Body example
           {
                "outTemperature": 4.7222,
                "inTemperature": 20.311,
                "pressureUpper": 2569.7,
                "pressureLower": 1.000,
                "co2Concentration": 1000,
                "ph": 5.8,
                "measuredTime": "2024-06-07T15:30:00"
            }
        */
        try {
            sensorMeasurementService.saveMeasurement(dto);
            return ResponseEntity.ok("Measurement saved successfully.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("An error occurred while saving the measurement.");
        }
    }

    @GetMapping
    public ResponseEntity<List<SensorMeasurementDTO>> getMeasurementsByBatchId(@RequestParam(value = "batchId", required = false) Long batchId) {
        try {
            List<SensorMeasurementDTO> results = sensorMeasurementService.getMeasurementsByBatchId(batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/date-range")
    // http://localhost:8080/sensor/date-range?start=2024-05-23&end=2024-06-11
    public ResponseEntity<List<SensorMeasurementDTO>> getMeasurementsByDateRange(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String startStr,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String endStr,
            @RequestParam(value = "batchId", required = false) Long batchId) {
        try {
            final Timestamp start = startStr != null ? parseTimestamp(startStr, true) : null;
            final Timestamp end = endStr != null ? parseTimestamp(endStr, false) : null;
            final Timestamp effectiveEnd = (start != null && end == null) ? Timestamp.valueOf(start.toLocalDateTime().toLocalDate().atTime(23, 59, 59)) : end;

            List<SensorMeasurementDTO> results = sensorMeasurementService.getMeasurementsByDateRange(start, effectiveEnd, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
            results.forEach(dto -> System.out.println("DTO: " + dto));

            if (results.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(results);
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching sensor measurements by date range: {} - {}", startStr, endStr, e);
            return ResponseEntity.status(400).body(null);
        }
    }


    @GetMapping("/value-range")
    //   http://localhost:8080/sensor/value-range?min=1.0&max=2.0&field=pressureUpper&batchId=1
    public ResponseEntity<List<SensorMeasurementDTO>> getMeasurementsByValueRange(
            @RequestParam(value = "min", required = true) BigDecimal min,
            @RequestParam(value = "max", required = true) BigDecimal max,
            @RequestParam(value = "field", required = true) String field,
            @RequestParam(value = "batchId", required = false) Long batchId) {
        try {
            List<SensorMeasurementDTO> results = sensorMeasurementService.getMeasurementsByValueRange(min, max, field, batchId != null ? batchId : currentBatchComponent.getCurrentBatchId());
            return ResponseEntity.ok(results);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument provided: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Error occurred while fetching measurements by value range", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    private Timestamp parseTimestamp(String dateTimeStr, boolean isStart) {
        try {
            if (dateTimeStr.length() == 10) { // Date only (yyyy-MM-dd)
                LocalDate date = LocalDate.parse(dateTimeStr, DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDateTime dateTime = isStart ? date.atStartOfDay() : date.atTime(23, 59, 59);
                return Timestamp.valueOf(dateTime);
            } else {
                return Timestamp.valueOf(LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME));
            }
        } catch (Exception e) {
            logger.error("Error parsing date/time string: {}", dateTimeStr, e);
            throw new IllegalArgumentException("Invalid date/time format");
        }
    }


}
