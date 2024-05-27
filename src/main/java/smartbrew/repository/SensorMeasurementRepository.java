package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartbrew.domain.SensorMeasurement;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Repository
public interface SensorMeasurementRepository extends JpaRepository<SensorMeasurement, Long> {
//    List<SensorMeasurement> findByBatchId(Long batchId);
    List<SensorMeasurement> findByBatch_BatchId(Long batchId);
    List<SensorMeasurement> findByMeasuredTimeBetween(Timestamp startTime, Timestamp endTime);
    List<SensorMeasurement> findByPressureUpperBetween(BigDecimal minPressure, BigDecimal maxPressure);
    List<SensorMeasurement> findByPressureLowerBetween(BigDecimal minPressure, BigDecimal maxPressure);
    List<SensorMeasurement> findByPhBetween(BigDecimal minPh, BigDecimal maxPh);
    List<SensorMeasurement> findByOutTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByInTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByCo2ConcentrationBetween(Integer minCo2, Integer maxCo2);
}
