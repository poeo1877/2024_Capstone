package smartbrew.controller;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.dto.SensorMeasurementDTO;
import smartbrew.dto.TemperatureSensorDTO;
import smartbrew.service.SensorMeasurementService;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/sensor")
public class SensorMeasurementController {
    @Autowired
    private Logger logger;

    @Autowired
    private SensorMeasurementService sensorMeasurementService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;
    /*@PostMapping("/measurement")
    public ResponseEntity<Void> createMeasurement(@RequestBody SensorMeasurementDTO dto) {
        *//*
            {
                "outTemperature": 24.7222,
                "inTemperature": 25.311,
                "pressureUpper": 100.52222,
                "pressureLower": 99.8,
                "co2Concentration": 480,
                "ph": 5.8,
                "measuredTime": "2024-06-10T15:30:00",
                "batchId": 3
            }
         *//*
        try {
            sensorMeasurementService.saveMeasurement(dto);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body(null); // Bad request if no fermenting batch found
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }*/

    @PostMapping("/measurement")
    public ResponseEntity<String> saveMeasurement(@RequestBody SensorMeasurementDTO dto) {
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
