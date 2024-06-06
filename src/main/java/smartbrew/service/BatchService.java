package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smartbrew.domain.Batch;
import smartbrew.repository.BatchRepositoryA;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Service
public class BatchService {
    private final BatchRepositoryA batchRepositoryA;

    @Autowired
    public BatchService(BatchRepositoryA batchRepositoryA) {
        this.batchRepositoryA = batchRepositoryA;
    }

    public List<Batch> findAllBatch() {
        return batchRepositoryA.findAll();
    }

    public List<Batch> findCompletedBatches() {
        return batchRepositoryA.findByEndTimeNotNull();
    }

    public BigDecimal findAverageInTemperature(Long batchId) {
        return batchRepositoryA.findAverageInTemperatureByBatchId(batchId);
    }

    public BigDecimal findAverageOutTemperature(Long batchId) {
        return batchRepositoryA.findAverageOutTemperatureByBatchId(batchId);
    }

    public List<Batch> findCompletedBatchesWithinDateRange(Timestamp startDate, Timestamp endDate) {
        return batchRepositoryA.findCompletedBatchesWithinDateRange(startDate, endDate);
    }
}
