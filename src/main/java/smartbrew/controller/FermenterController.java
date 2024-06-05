package smartbrew.controller;

import smartbrew.domain.FermentationStatus;
import smartbrew.domain.Fermenter;
import smartbrew.dto.BatchDTO;
import smartbrew.dto.FermenterDTO;
import smartbrew.service.FermenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/fermenter")
public class FermenterController {
    @Autowired
    private Logger logger;

    @Autowired
    private FermenterService fermenterService;

    @GetMapping
    public ResponseEntity<List<FermenterDTO>> getAllFermenters() {
        try {
            return ResponseEntity.ok(fermenterService.getAllFermenters());
        } catch (Exception e) {
            logger.error("Error occurred while fetching all fermenters", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FermenterDTO> getFermenterById(@PathVariable Long id) {
        try {
            FermenterDTO dto = fermenterService.getFermenterById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while fetching fermenter by ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<FermenterDTO> createFermenter(@RequestBody FermenterDTO dto) {
        try {
            return ResponseEntity.ok(fermenterService.createFermenter(dto));
        } catch (Exception e) {
            logger.error("Error occurred while creating fermenter", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<FermenterDTO> updateFermenter(@PathVariable Long id, @RequestBody FermenterDTO dto) {
        try {
            FermenterDTO updatedDto = fermenterService.updateFermenter(id, dto);
            return ResponseEntity.ok(updatedDto);
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while updating fermenter with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFermenter(@PathVariable Long id) {
        try {
            fermenterService.deleteFermenter(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            logger.error("Error occurred: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error occurred while deleting fermenter with ID: {}", id, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    /*@GetMapping("/status")
    public ResponseEntity<?> getFermenterStatuses(@RequestParam(value = "status", required = false) String status) {
        try {
            if (status == null) {
                List<String> statuses = Arrays.stream(FermentationStatus.values())
                        .map(Enum::name)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(statuses);
            }  else if (status.equalsIgnoreCase("all")) {
                List<FermenterDTO> fermenters = fermenterService.getAllFermenters();
                return ResponseEntity.ok(fermenters);
            } else {
                try {
                    FermentationStatus fermentationStatus = FermentationStatus.valueOf(status.toUpperCase());
                    List<FermenterDTO> fermenters = fermenterService.getFermentersByStatusFiltered(fermentationStatus);
                    return ResponseEntity.ok(fermenters);
                } catch (IllegalArgumentException e) {
                    logger.error("Invalid status value provided: {}", status, e);
                    return ResponseEntity.badRequest().body("Invalid status value. Valid values are: WAITING, FERMENTING, COMPLETED, ERROR, ALL");
                }
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching fermenter statuses or fermenters by status", e);
            return ResponseEntity.status(500).body(null);
        }
    }*/

    @GetMapping("/status")
    public ResponseEntity<?> getFermenterStatuses(@RequestParam(value = "status", required = false) String status) {
        try {
            if (status == null) {
                List<String> statuses = Arrays.stream(FermentationStatus.values())
                        .map(Enum::name)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(statuses);
            } else {
                try {
                    FermentationStatus fermentationStatus = FermentationStatus.valueOf(status.toUpperCase());
                    List<BatchDTO> batches = fermenterService.getBatchesByFermenterStatus(fermentationStatus);
                    return ResponseEntity.ok(batches);
                } catch (IllegalArgumentException e) {
                    logger.error("Invalid status value provided: {}", status, e);
                    return ResponseEntity.badRequest().body("Invalid status value. Valid values are: WAITING, FERMENTING, COMPLETED, ERROR");
                }
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching fermenter statuses or batches by status", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/lines")
    public ResponseEntity<?> getFermenterLines(@RequestParam(value = "line", required = false) String line) {
        try {
            if (line == null) {
                // If no line is specified, fetch all distinct fermenter lines
                List<String> distinctLines = fermenterService.getDistinctFermenterLines();
                return ResponseEntity.ok(distinctLines);
            } else {
                // If a line is specified, fetch fermenters by that line
                List<FermenterDTO> fermenters = fermenterService.getFermentersByLine(line);
                return ResponseEntity.ok(fermenters);
            }
        } catch (Exception e) {
            logger.error("Error occurred while fetching fermenter lines or fermenters by line", e);
            return ResponseEntity.status(500).body(null);
        }
    }

}
