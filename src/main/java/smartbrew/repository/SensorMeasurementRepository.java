package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartbrew.domain.SensorMeasurement;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import smartbrew.dto.PressureSensorDTO;


import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;


@Repository
public interface SensorMeasurementRepository extends JpaRepository<SensorMeasurement, Long> {
  /*  List<SensorMeasurement> findByPhBetween(BigDecimal minPh, BigDecimal maxPh);
    List<SensorMeasurement> findByOutTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByInTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByCo2ConcentrationBetween(Integer minCo2, Integer maxCo2);*/
    List<SensorMeasurement> findByBatch_BatchId(Long batchId);
    List<SensorMeasurement> findByMeasuredTimeBetween(Timestamp start, Timestamp end);
    List<SensorMeasurement> findByMeasuredTimeAfter(Timestamp start);
    List<SensorMeasurement> findByMeasuredTimeBefore(Timestamp end);

    /*
      ("/sensors/pressure") 에서 사용할 함수들
     */
    List<SensorMeasurement> findByPressureUpperBetween(BigDecimal min, BigDecimal max);
    List<SensorMeasurement> findByPressureUpperGreaterThanEqual(BigDecimal min);
    List<SensorMeasurement> findByPressureUpperLessThanEqual(BigDecimal max);
    List<SensorMeasurement> findByPressureLowerBetween(BigDecimal min, BigDecimal max);
    List<SensorMeasurement> findByPressureLowerGreaterThanEqual(BigDecimal min);
    List<SensorMeasurement> findByPressureLowerLessThanEqual(BigDecimal max);

    @Query("SELECT new smartbrew.dto.PressureSensorDTO(sm.dataId, sm.pressureUpper, sm.pressureLower, sm.measuredTime, sm.batch.batchId) " +
            "FROM SensorMeasurement sm " +
            "WHERE sm.measuredTime >= :sixMonthsAgo")
    List<PressureSensorDTO> findPressureSensorDataForLastSixMonths(@Param("sixMonthsAgo") Timestamp sixMonthsAgo);


    /*
      ("/sensor/temperature") 에서 사용할 함수들
     */
    List<SensorMeasurement> findByInTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByInTemperatureGreaterThanEqual(BigDecimal minTemp);
    List<SensorMeasurement> findByInTemperatureLessThanEqual(BigDecimal maxTemp);

    List<SensorMeasurement> findByOutTemperatureBetween(BigDecimal minTemp, BigDecimal maxTemp);
    List<SensorMeasurement> findByOutTemperatureGreaterThanEqual(BigDecimal minTemp);
    List<SensorMeasurement> findByOutTemperatureLessThanEqual(BigDecimal maxTemp);

}
