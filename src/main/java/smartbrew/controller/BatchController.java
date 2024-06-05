package smartbrew.controller;

import org.springframework.format.annotation.DateTimeFormat;
import smartbrew.dto.BatchDTO;
import smartbrew.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/batch")
public class BatchController {

    @Autowired
    private Logger logger;

    @Autowired
    private BatchService service;

    @GetMapping
    public ResponseEntity<List<BatchDTO>> getAllBatches() {
        try {
            return ResponseEntity.ok(service.getAllBatches());
        } catch (Exception e) {
            logger.error("Error occurred while fetching all batches", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BatchDTO> getBatchById(@PathVariable Long id) {
        try {
            BatchDTO dto = service.getBatchById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while fetching batch by ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<BatchDTO> createBatch(@RequestBody BatchDTO dto) {
        try {
            return ResponseEntity.ok(service.createBatch(dto));
        } catch (Exception e) {
            logger.error("Error occurred while creating batch", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BatchDTO> updateBatch(@PathVariable Long id, @RequestBody BatchDTO dto) {
        try {
            BatchDTO updatedDto = service.updateBatch(id, dto);
            return ResponseEntity.ok(updatedDto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while updating batch with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Long id) {
        try {
            service.deleteBatch(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while deleting batch with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/date")
    public ResponseEntity<List<BatchDTO>> getBatchesByDate(
            @RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String startStr,
            @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String endStr) {
        try {
            Timestamp start = startStr != null ? parseTimestamp(startStr, true) : null;
            Timestamp end = endStr != null ? parseTimestamp(endStr, false) : null;

            // If both start and end are not provided, fetch all rows sorted by start_time
            if (start == null && end == null) {
                List<BatchDTO> results = service.getAllBatchesSortedByStartTime();
                return ResponseEntity.ok(results);
            }

            // If only start is provided, set end to the current time
            if (start != null && end == null) {
                List<BatchDTO> results = service.getBatchesByStartDate(start);
                return ResponseEntity.ok(results);
            }

            // If only end is provided, fetch rows less than end in descending order
            if (start == null && end != null) {
                List<BatchDTO> results = service.getBatchesByEndDate(end);
                return ResponseEntity.ok(results);
            }

            List<BatchDTO> results = service.getBatchesByDateRange(start, end);
            if (results.isEmpty()) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.ok(results);
            }

        } catch (Exception e) {
            logger.error("Error occurred while fetching batches by date range: {} - {}", startStr, endStr, e);
            return ResponseEntity.status(400).body(null);
        }
    }

    @GetMapping("/recipe")
    public ResponseEntity<?> getBatchesByRecipeId(
            @RequestParam(value = "recipeId", required = false) Long recipeId) {
        try {
            if (recipeId != null) {
                List<BatchDTO> results = service.getBatchesByRecipeId(recipeId);
                return ResponseEntity.ok(results);
            } else {
                List<Long> recipeIds = service.getAllRecipeIds();
                return ResponseEntity.ok(recipeIds);
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching batches by recipe ID: {}", recipeId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/fermenter")
    public ResponseEntity<?> getBatchesByFermenterId(
            @RequestParam(value = "fermenterId", required = false) Long fermenterId) {
        try {
            if (fermenterId != null) {
                List<BatchDTO> results = service.getBatchesByFermenterId(fermenterId);
                return ResponseEntity.ok(results);
            } else {
                List<Long> fermenterIds = service.getAllFermenterIds();
                return ResponseEntity.ok(fermenterIds);
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching batches by fermenter ID: {}", fermenterId, e);
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
