package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import smartbrew.domain.SensorMeasurement;
import smartbrew.dto.SensorMeasurementDto;
import smartbrew.repository.SensorMeasurementRepository;

import java.awt.print.Pageable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Service
public class SensorMeasurementService {

    private final SensorMeasurementRepository sensorMeasurementRepository;

    @Autowired
    public SensorMeasurementService(SensorMeasurementRepository sensorMeasurementRepository) {
        this.sensorMeasurementRepository = sensorMeasurementRepository;
    }

    public List<SensorMeasurement> findByBatchId(Long batchId) {
        return sensorMeasurementRepository.findByBatch_BatchId(batchId);
    }

    public List<SensorMeasurement> findByMeasuredTimeBetween(Timestamp startTime, Timestamp endTime) {
        return sensorMeasurementRepository.findByMeasuredTimeBetween(startTime, endTime);
    }

    public List<SensorMeasurement> findByPressureUpperBetween(BigDecimal minPressure, BigDecimal maxPressure) {
        return sensorMeasurementRepository.findByPressureUpperBetween(minPressure, maxPressure);
    }

    @Autowired
    private SensorMeasurementRepository sensorMeasurementRepository1;

    public SensorMeasurementDto getLatestTemperatures() {
            SensorMeasurement latestMeasurement = sensorMeasurementRepository1.findLatestMeasurements(PageRequest.of(0, 1)).get(0);

        return new SensorMeasurementDto(latestMeasurement.getInTemperature(), latestMeasurement.getOutTemperature());
    }

    public List<SensorMeasurement> findSensorMeasurementsWithinDateRange(Timestamp startTimestamp, Timestamp endTimestamp) {
        return sensorMeasurementRepository.findByMeasuredTimeBetween(startTimestamp, endTimestamp);
    }
    // 다른 메소드들도 비슷한 방식으로 구현
}
