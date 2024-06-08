package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import smartbrew.domain.SensorMeasurement;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;


@Repository
public interface SensorMeasurementRepository extends JpaRepository<SensorMeasurement, Long> {
    List<SensorMeasurement> findByMeasuredTimeBetween(Timestamp startTime, Timestamp endTime);
    List<SensorMeasurement> findByBatch_BatchIdOrderByMeasuredTimeAsc(Long batchId);
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

    List<SensorMeasurement> findTop2ByBatch_BatchIdOrderByMeasuredTimeDesc(Long batchId);

    @Query("SELECT MAX(sm.inTemperature) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMaxInTemperatureByBatchId(Long batchId);

    @Query("SELECT MIN(sm.inTemperature) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMinInTemperatureByBatchId(Long batchId);

    @Query("SELECT AVG(sm.inTemperature) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findAvgInTemperatureByBatchId(Long batchId);

    @Query("SELECT MAX(sm.brix) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMaxBrixByBatchId(Long batchId);

    @Query("SELECT MIN(sm.brix) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMinBrixByBatchId(Long batchId);

    @Query("SELECT AVG(sm.brix) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findAvgBrixByBatchId(Long batchId);

    @Query("SELECT MAX(sm.ph) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMaxPhByBatchId(Long batchId);

    @Query("SELECT MIN(sm.ph) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findMinPhByBatchId(Long batchId);

    @Query("SELECT AVG(sm.ph) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findAvgPhByBatchId(Long batchId);

    @Query("SELECT MAX(sm.co2Concentration) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    Integer findMaxCo2ByBatchId(Long batchId);

    @Query("SELECT MIN(sm.co2Concentration) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    Integer findMinCo2ByBatchId(Long batchId);

    @Query("SELECT AVG(sm.co2Concentration) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    Integer findAvgCo2ByBatchId(Long batchId);
}
