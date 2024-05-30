package smartbrew.controller;

import smartbrew.dto.PressureSensorDTO;
import smartbrew.service.SensorMeasurementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/sensors/pressure")
public class PressureSensorController {
    @Autowired
    private Logger logger;
    @Autowired
    private SensorMeasurementService service;

    @GetMapping
    public ResponseEntity<List<PressureSensorDTO>> getAllMeasurements() {
        try {
            return ResponseEntity.ok(service.getAllMeasurements());
        } catch (Exception e) {
            logger.error("Error occurred while fetching all sensor measurements", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PressureSensorDTO> getMeasurementById(@PathVariable Long id) {
        try {
            PressureSensorDTO dto = service.getMeasurementById(id);
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
    public ResponseEntity<PressureSensorDTO> createMeasurement(@RequestBody PressureSensorDTO dto) {
        try {
            return ResponseEntity.ok(service.createMeasurement(dto));
        } catch (Exception e) {
            logger.error("Error occurred while creating sensor measurement", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PressureSensorDTO> updateMeasurement(@PathVariable Long id, @RequestBody PressureSensorDTO dto) {
        try {
            PressureSensorDTO updatedDto = service.updateMeasurement(id, dto);
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
    public ResponseEntity<List<PressureSensorDTO>> getMeasurementsByDateRange(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String startStr,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String endStr) {
        try {
            final Timestamp start = startStr != null ? parseTimestamp(startStr, true) : null;
            final Timestamp end = endStr != null ? parseTimestamp(endStr, false) : null;

            // If only start is provided, set end to the end of the same day
            final Timestamp defaultEnd = (start != null && end == null) ? Timestamp.valueOf(start.toLocalDateTime().toLocalDate().atTime(23, 59, 59)) : end;

            List<PressureSensorDTO> results = service.getMeasurementsByDateRange(start, defaultEnd);

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
