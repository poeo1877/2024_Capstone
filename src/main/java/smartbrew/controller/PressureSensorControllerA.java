package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import smartbrew.domain.Batch;
import smartbrew.domain.SensorMeasurement;
import smartbrew.repository.BatchRepositoryA;
import smartbrew.repository.SensorMeasurementRepositoryA;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sensors/pressure")
public class PressureSensorControllerA extends BaseSensorController<PressureSensorDTO> {

    @Autowired
    private SensorMeasurementRepositoryA repository;

    @Autowired
    private BatchRepositoryA batchRepositoryA;

    @Override
    public ResponseEntity<List<PressureSensorDTO>> getByBatchId(@PathVariable Long batchId) {
//        List<PressureSensorDTO> results = repository.findByBatchId(batchId)
        List<PressureSensorDTO> results = repository.findByBatch_BatchId(batchId)
                .stream()
                .map(sensorMeasurement -> {
                    PressureSensorDTO dto = new PressureSensorDTO();
                    dto.setDataId(sensorMeasurement.getDataId());
                    dto.setPressureUpper(sensorMeasurement.getPressureUpper());
                    dto.setPressureLower(sensorMeasurement.getPressureLower());
                    dto.setMeasuredTime(sensorMeasurement.getMeasuredTime());
                    dto.setBatchId(sensorMeasurement.getBatch().getBatchId());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @Override
    public ResponseEntity<List<PressureSensorDTO>> getByDateRange(@RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Timestamp start,
                                                                  @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Timestamp end) {
        List<PressureSensorDTO> results = repository.findByMeasuredTimeBetween(start, end)
                .stream()
                .map(sensorMeasurement -> {
                    PressureSensorDTO dto = new PressureSensorDTO();
                    dto.setDataId(sensorMeasurement.getDataId());
                    dto.setPressureUpper(sensorMeasurement.getPressureUpper());
                    dto.setPressureLower(sensorMeasurement.getPressureLower());
                    dto.setMeasuredTime(sensorMeasurement.getMeasuredTime());
                    dto.setBatchId(sensorMeasurement.getBatch().getBatchId());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @Override
    public ResponseEntity<List<PressureSensorDTO>> getByValueRange(@RequestParam("min") BigDecimal min, @RequestParam("max") BigDecimal max) {
        List<PressureSensorDTO> results = repository.findByPressureUpperBetween(min, max)
                .stream()
                .map(sensorMeasurement -> {
                    PressureSensorDTO dto = new PressureSensorDTO();
                    dto.setDataId(sensorMeasurement.getDataId());
                    dto.setPressureUpper(sensorMeasurement.getPressureUpper());
                    dto.setPressureLower(sensorMeasurement.getPressureLower());
                    dto.setMeasuredTime(sensorMeasurement.getMeasuredTime());
                    dto.setBatchId(sensorMeasurement.getBatch().getBatchId());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }

    @Override
    @PostMapping("/data")
    public ResponseEntity<PressureSensorDTO> postData(@RequestBody PressureSensorDTO data) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setPressureUpper(data.getPressureUpper());
        sensorMeasurement.setPressureLower(data.getPressureLower());
        sensorMeasurement.setMeasuredTime(data.getMeasuredTime());

        Optional<Batch> batch = batchRepositoryA.findById(Math.toIntExact(data.getBatchId()));
        batch.ifPresent(sensorMeasurement::setBatch);

        SensorMeasurement savedMeasurement = repository.save(sensorMeasurement);

        data.setDataId(savedMeasurement.getDataId());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/all")
    public ResponseEntity<List<PressureSensorDTO>> getAll() {
        List<PressureSensorDTO> results = repository.findAll()
                .stream()
                .map(sensorMeasurement -> {
                    PressureSensorDTO dto = new PressureSensorDTO();
                    dto.setDataId(sensorMeasurement.getDataId());
                    dto.setPressureUpper(sensorMeasurement.getPressureUpper());
                    dto.setPressureLower(sensorMeasurement.getPressureLower());
                    dto.setMeasuredTime(sensorMeasurement.getMeasuredTime());
                    dto.setBatchId(sensorMeasurement.getBatch() != null ? sensorMeasurement.getBatch().getBatchId() : null);
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(results);
    }
}