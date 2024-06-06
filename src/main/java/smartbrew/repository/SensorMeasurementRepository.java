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



  List<SensorMeasurement> findByBatch_BatchIdOrderByMeasuredTimeAsc(Long batchId);
  List<SensorMeasurement> findByMeasuredTimeBetweenAndBatch_BatchIdOrderByMeasuredTimeAsc(Timestamp start, Timestamp end, Long batchId);
  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(CAST(:start AS timestamp) IS NULL OR s.measuredTime >= :start) AND " +
          "(CAST(:end AS timestamp) IS NULL OR s.measuredTime <= :end) AND " +
          "s.batch.batchId = :batchId ORDER BY s.measuredTime")
  List<SensorMeasurement> findByMeasuredTimeBetweenAndBatchIdOrderByMeasuredTimeAsc(
          @Param("start") Timestamp start,
          @Param("end") Timestamp end,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:min IS NULL OR s.outTemperature >= :min) AND " +
          "(:max IS NULL OR s.outTemperature <= :max) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByOutTemperatureBetweenAndBatchId(
          @Param("min") BigDecimal min,
          @Param("max") BigDecimal max,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:min IS NULL OR s.inTemperature >= :min) AND " +
          "(:max IS NULL OR s.inTemperature <= :max) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByInTemperatureBetweenAndBatchId(
          @Param("min") BigDecimal min,
          @Param("max") BigDecimal max,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:min IS NULL OR s.pressureUpper >= :min) AND " +
          "(:max IS NULL OR s.pressureUpper <= :max) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByPressureUpperBetweenAndBatchId(
          @Param("min") BigDecimal min,
          @Param("max") BigDecimal max,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:min IS NULL OR s.pressureLower >= :min) AND " +
          "(:max IS NULL OR s.pressureLower <= :max) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByPressureLowerBetweenAndBatchId(
          @Param("min") BigDecimal min,
          @Param("max") BigDecimal max,
          @Param("batchId") Long batchId);

  // Queries for value-range filtering
  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:minCo2 IS NULL OR s.co2Concentration >= :minCo2) AND " +
          "(:maxCo2 IS NULL OR s.co2Concentration <= :maxCo2) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByCo2ConcentrationBetweenAndBatchId(
          @Param("minCo2") Integer minCo2,
          @Param("maxCo2") Integer maxCo2,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:minPh IS NULL OR s.ph >= :minPh) AND " +
          "(:maxPh IS NULL OR s.ph <= :maxPh) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByPhBetweenAndBatchId(
          @Param("minPh") BigDecimal minPh,
          @Param("maxPh") BigDecimal maxPh,
          @Param("batchId") Long batchId);

  @Query("SELECT s FROM SensorMeasurement s WHERE " +
          "(:minBrix IS NULL OR s.brix >= :minBrix) AND " +
          "(:maxBrix IS NULL OR s.brix <= :maxBrix) AND " +
          "(:batchId IS NULL OR s.batch.batchId = :batchId)")
  List<SensorMeasurement> findByBrixBetweenAndBatchId(
          @Param("minBrix") BigDecimal minBrix,
          @Param("maxBrix") BigDecimal maxBrix,
          @Param("batchId") Long batchId);

}
