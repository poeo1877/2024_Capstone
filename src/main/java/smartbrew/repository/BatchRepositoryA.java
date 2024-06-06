package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import smartbrew.domain.Batch;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public interface BatchRepositoryA extends JpaRepository<Batch, Integer> {
    List<Batch> findByEndTimeNotNull();

    @Query("SELECT AVG(sm.inTemperature) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findAverageInTemperatureByBatchId(@Param("batchId") Long batchId);

    @Query("SELECT AVG(sm.outTemperature) FROM SensorMeasurement sm WHERE sm.batch.batchId = :batchId")
    BigDecimal findAverageOutTemperatureByBatchId(@Param("batchId") Long batchId);

    @Query("SELECT b FROM Batch b WHERE b.endTime IS NOT NULL AND b.endTime BETWEEN :startDate AND :endDate")
    List<Batch> findCompletedBatchesWithinDateRange(@Param("startDate") Timestamp startDate, @Param("endDate") Timestamp endDate);
}
