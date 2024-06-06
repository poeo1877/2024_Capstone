package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartbrew.dto.SensorMeasurementDTO;
import smartbrew.service.SensorMeasurementService;

@RestController
@RequestMapping("/sensor")
public class SensorMeasurementController {

    @Autowired
    private SensorMeasurementService sensorMeasurementService;

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

}
