package smartbrew.component;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import smartbrew.domain.Batch;
import smartbrew.repository.BatchRepository;

@Component
public class CurrentBatchComponent {

    private Long currentBatchId;

    @Autowired
    private BatchRepository batchRepository;

    public Long getCurrentBatchId() {
        if (currentBatchId == null) {
            fetchCurrentBatchId();
        }
        return currentBatchId;
    }

    private void fetchCurrentBatchId() {
        Batch currentBatch = batchRepository.findBatchByFermenterStatusFermenting();
        if (currentBatch != null) {
            this.currentBatchId = currentBatch.getBatchId();
        } else {
            this.currentBatchId = null; // No batch is currently fermenting
        }
    }

    public void refreshCurrentBatchId() {
        fetchCurrentBatchId();
    }
}
