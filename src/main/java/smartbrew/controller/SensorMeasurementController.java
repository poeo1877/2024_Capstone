package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.SensorMeasurementDto;
import smartbrew.service.SensorMeasurementService;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/sensorMeasurements")
public class SensorMeasurementController {

    private final SensorMeasurementService sensorMeasurementService;

    @Autowired
    public SensorMeasurementController(SensorMeasurementService sensorMeasurementService) {
        this.sensorMeasurementService = sensorMeasurementService;
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<SensorMeasurement>> findByBatchId(@PathVariable Long batchId) {
        List<SensorMeasurement> measurements = sensorMeasurementService.findByBatchId(batchId);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/measuredTime")
    public ResponseEntity<List<SensorMeasurement>> findByMeasuredTimeBetween(@RequestParam Timestamp startTime, @RequestParam Timestamp endTime) {
        List<SensorMeasurement> measurements = sensorMeasurementService.findByMeasuredTimeBetween(startTime, endTime);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/pressureUpper")
    public ResponseEntity<List<SensorMeasurement>> findByPressureUpperBetween(@RequestParam BigDecimal minPressure, @RequestParam BigDecimal maxPressure) {
        List<SensorMeasurement> measurements = sensorMeasurementService.findByPressureUpperBetween(minPressure, maxPressure);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/latest-temperatures")
    public ResponseEntity<SensorMeasurementDto> getLatestTemperatures() {
        SensorMeasurementDto latestTemperatures = sensorMeasurementService.getLatestTemperatures();
        return ResponseEntity.ok(latestTemperatures);
    }
    // 다른 엔드포인트들도 비슷한 방식으로 구현
}
