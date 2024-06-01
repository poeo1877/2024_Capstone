package smartbrew.controller;

import org.springframework.beans.factory.annotation.Value;
import smartbrew.dto.TemperatureSensorDTO;
import smartbrew.service.TemperatureSensorMeasurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/sensors/temperature")
public class TemperatureSensorController {

    @Autowired
    private Logger logger;

    @Autowired
    private TemperatureSensorMeasurementService service;

    @GetMapping
    public ResponseEntity<List<TemperatureSensorDTO>> getAllMeasurements() {
        try {
            return ResponseEntity.ok(service.getAllMeasurements());
        } catch (Exception e) {
            logger.error("Error occurred while fetching all sensor measurements", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemperatureSensorDTO> getMeasurementById(@PathVariable Long id) {
        try {
            TemperatureSensorDTO dto = service.getMeasurementById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while fetching sensor measurement by ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<TemperatureSensorDTO> createMeasurement(@RequestBody TemperatureSensorDTO dto) {
        try {
            return ResponseEntity.ok(service.createMeasurement(dto));
        } catch (Exception e) {
            logger.error("Error occurred while creating sensor measurement", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemperatureSensorDTO> updateMeasurement(@PathVariable Long id, @RequestBody TemperatureSensorDTO dto) {
        try {
            TemperatureSensorDTO updatedDto = service.updateMeasurement(id, dto);
            return ResponseEntity.ok(updatedDto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while updating sensor measurement with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeasurement(@PathVariable Long id) {
        try {
            service.deleteMeasurement(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while deleting sensor measurement with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<TemperatureSensorDTO>> getMeasurementsByDateRange(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String startStr,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String endStr) {
        try {
            final Timestamp start = startStr != null ? parseTimestamp(startStr, true) : null;
            final Timestamp end = endStr != null ? parseTimestamp(endStr, false) : null;

            // If only start is provided, set end to the end of the same day
            final Timestamp effectiveEnd = (start != null && end == null) ? Timestamp.valueOf(start.toLocalDateTime().toLocalDate().atTime(23, 59, 59)) : end;

            List<TemperatureSensorDTO> results = service.getMeasurementsByDateRange(start, effectiveEnd);

            // DB에서 들어온 DTO의 시간 값이 서울 기준인지 확인하는 용도
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
    public ResponseEntity<List<TemperatureSensorDTO>> getMeasurementsByTemperatureRange(
            @RequestParam(value = "min", required = false) BigDecimal minTemp,
            @RequestParam(value = "max", required = false) BigDecimal maxTemp,
            @RequestParam(value = "position", required = false) String position) {
        try {
            List<TemperatureSensorDTO> results = service.getMeasurementsByTemperatureRange(minTemp, maxTemp, position);

            results.forEach(dto -> System.out.println("DTO: " + dto));

            if (results.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(results);
            }
        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument provided: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            logger.error("Error occurred while fetching sensor measurements by temperature range: {} - {}, position: {}", minTemp, maxTemp, position, e);
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
