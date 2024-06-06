package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import smartbrew.domain.SensorMeasurement;
import smartbrew.repository.SensorMeasurementRepositoryA;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Service
public class SensorMeasurementServiceA {

    private final SensorMeasurementRepositoryA sensorMeasurementRepositoryA;

    @Autowired
    public SensorMeasurementServiceA(SensorMeasurementRepositoryA sensorMeasurementRepositoryA) {
        this.sensorMeasurementRepositoryA = sensorMeasurementRepositoryA;
    }

    public List<SensorMeasurement> findByBatchId(Long batchId) {
        return sensorMeasurementRepositoryA.findByBatch_BatchId(batchId);
    }

    public List<SensorMeasurement> findByMeasuredTimeBetween(Timestamp startTime, Timestamp endTime) {
        return sensorMeasurementRepositoryA.findByMeasuredTimeBetween(startTime, endTime);
    }

    public List<SensorMeasurement> findByPressureUpperBetween(BigDecimal minPressure, BigDecimal maxPressure) {
        return sensorMeasurementRepositoryA.findByPressureUpperBetween(minPressure, maxPressure);
    }

    @Autowired
    private SensorMeasurementRepositoryA sensorMeasurementRepositoryA1;

    public SensorMeasurementDto getLatestTemperatures() {
            SensorMeasurement latestMeasurement = sensorMeasurementRepositoryA1.findLatestMeasurements(PageRequest.of(0, 1)).get(0);

        return new SensorMeasurementDto(latestMeasurement.getInTemperature(), latestMeasurement.getOutTemperature());
    }

    public List<SensorMeasurement> findSensorMeasurementsWithinDateRange(Timestamp startTimestamp, Timestamp endTimestamp) {
        return sensorMeasurementRepositoryA.findByMeasuredTimeBetween(startTimestamp, endTimestamp);
    }
    // 다른 메소드들도 비슷한 방식으로 구현
}
