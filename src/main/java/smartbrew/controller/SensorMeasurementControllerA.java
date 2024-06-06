package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartbrew.domain.SensorMeasurement;
import smartbrew.service.SensorMeasurementServiceA;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@RestController
@RequestMapping("/sensorMeasurements")
public class SensorMeasurementControllerA {

    private final SensorMeasurementServiceA sensorMeasurementServiceA;

    @Autowired
    public SensorMeasurementControllerA(SensorMeasurementServiceA sensorMeasurementServiceA) {
        this.sensorMeasurementServiceA = sensorMeasurementServiceA;
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<SensorMeasurement>> findByBatchId(@PathVariable Long batchId) {
        List<SensorMeasurement> measurements = sensorMeasurementServiceA.findByBatchId(batchId);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/measuredTime")
    public ResponseEntity<List<SensorMeasurement>> findByMeasuredTimeBetween(@RequestParam Timestamp startTime, @RequestParam Timestamp endTime) {
        List<SensorMeasurement> measurements = sensorMeasurementServiceA.findByMeasuredTimeBetween(startTime, endTime);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/pressureUpper")
    public ResponseEntity<List<SensorMeasurement>> findByPressureUpperBetween(@RequestParam BigDecimal minPressure, @RequestParam BigDecimal maxPressure) {
        List<SensorMeasurement> measurements = sensorMeasurementServiceA.findByPressureUpperBetween(minPressure, maxPressure);
        return ResponseEntity.ok(measurements);
    }

    @GetMapping("/latest-temperatures")
    public ResponseEntity<SensorMeasurementDto> getLatestTemperatures() {
        SensorMeasurementDto latestTemperatures = sensorMeasurementServiceA.getLatestTemperatures();
        return ResponseEntity.ok(latestTemperatures);
    }
    // 다른 엔드포인트들도 비슷한 방식으로 구현
}
