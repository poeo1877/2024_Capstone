package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smartbrew.domain.Batch;
import smartbrew.repository.BatchRepository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

@Service
public class BatchService {
    private final BatchRepository batchRepository;

    @Autowired
    public BatchService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    public List<Batch> findAllBatch() {
        return batchRepository.findAll();
    }

    public List<Batch> findCompletedBatches() {
        return batchRepository.findByEndTimeNotNull();
    }

    public BigDecimal findAverageInTemperature(Long batchId) {
        return batchRepository.findAverageInTemperatureByBatchId(batchId);
    }

    public BigDecimal findAverageOutTemperature(Long batchId) {
        return batchRepository.findAverageOutTemperatureByBatchId(batchId);
    }

    public List<Batch> findCompletedBatchesWithinDateRange(Timestamp startDate, Timestamp endDate) {
        return batchRepository.findCompletedBatchesWithinDateRange(startDate, endDate);
    }
}
