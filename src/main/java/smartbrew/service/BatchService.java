package smartbrew.service;

import org.springframework.data.domain.Sort;
import smartbrew.domain.Batch;
import smartbrew.domain.Fermenter;
import smartbrew.domain.Recipe;
import smartbrew.dto.BatchDTO;
import smartbrew.dto.BatchDetailsDTO;
import smartbrew.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    @Autowired
    private Logger logger;


    public List<BatchDTO> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<BatchDTO> getAllBatchesSortedByStartTime() {
        return batchRepository.findAll(Sort.by(Sort.Direction.ASC, "startTime")).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BatchDTO getBatchById(Long id) {
        return batchRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new IllegalArgumentException("Batch with ID " + id + " not found"));
    }

    public BatchDTO createBatch(BatchDTO dto) {
        Batch batch = convertToEntity(dto);
        Batch savedBatch = batchRepository.save(batch);
        return convertToDto(savedBatch);
    }

    public BatchDTO updateBatch(Long id, BatchDTO dto) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Batch with ID " + id + " not found"));

        batch.setStartTime(dto.getStartTime());
        batch.setEndTime(dto.getEndTime());
        batch.setRecipeRatio(dto.getRecipeRatio());
        batch.setFermenter(convertToFermenter(dto.getFermenterId()));
        batch.setRecipe(convertToRecipe(dto.getRecipeId()));

        Batch updatedBatch = batchRepository.save(batch);
        return convertToDto(updatedBatch);
    }

    public String getBatchName(Long batchId) {
        Batch batch = batchRepository.findBatchWithRecipeAndFermenter(batchId);
        if (batch == null) {
            throw new IllegalArgumentException("Batch with ID " + batchId + " not found");
        }
        String formattedDate = batch.getStartTime().toLocalDateTime().toLocalDate().format(DateTimeFormatter.ISO_DATE);
        String fermenterLine = batch.getFermenter().getFermenterLine();
        return formattedDate + "-" + fermenterLine;
    }

    public void deleteBatch(Long id) {
        if (!batchRepository.existsById(id)) {
            throw new IllegalArgumentException("Batch with ID " + id + " not found");
        }
        batchRepository.deleteById(id);
    }

    public List<BatchDTO> getBatchesByDateRange(Timestamp start, Timestamp end) {
        List<Batch> batches = batchRepository.findByDateRange(start, end);
        return batches.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }


    public List<BatchDTO> getBatchesByStartDate(Timestamp startDate) {
        List<Batch> batches = batchRepository.findByStartTimeAfterOrderByStartTimeAsc(startDate);
        return batches.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<BatchDTO> getBatchesByEndDate(Timestamp endDate) {
        List<Batch> batches = batchRepository.findByEndTimeBeforeOrderByEndTimeDesc(endDate);
        return batches.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<BatchDTO> getBatchesByRecipeId(Long recipeId) {
        List<Batch> batches = batchRepository.findByRecipe_RecipeId(recipeId);
        return batches.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<BatchDTO> getBatchesByFermenterId(Long fermenterId) {
        List<Batch> batches = batchRepository.findByFermenter_FermenterId(fermenterId);
        return batches.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public List<Long> getAllRecipeIds() {
        return batchRepository.findAll().stream()
                .map(batch -> batch.getRecipe().getRecipeId())
                .distinct()
                .collect(Collectors.toList());
    }

    public List<Long> getAllFermenterIds() {
        return batchRepository.findAll().stream()
                .map(batch -> batch.getFermenter().getFermenterId())
                .distinct()
                .collect(Collectors.toList());
    }

    public BatchDTO convertToDto(Batch batch) {
        return new BatchDTO(
                batch.getBatchId(),
                batch.getStartTime(),
                batch.getEndTime(),
                batch.getRecipeRatio(),
                batch.getRecipe() != null ? batch.getRecipe().getRecipeId() : null,
                batch.getFermenter() != null ? batch.getFermenter().getFermenterId() : null,
                batch.getRecipe() != null ? batch.getRecipe().getProductName() : null
        );
    }

    public Batch convertToEntity(BatchDTO dto) {
        Batch batch = new Batch();
        batch.setBatchId(dto.getBatchId());
        batch.setStartTime(dto.getStartTime());
        batch.setEndTime(dto.getEndTime());
        batch.setRecipeRatio(dto.getRecipeRatio());
        batch.setFermenter(convertToFermenter(dto.getFermenterId()));
        batch.setRecipe(convertToRecipe(dto.getRecipeId()));
        return batch;
    }

    public Fermenter convertToFermenter(Long fermenterId) {
        Fermenter fermenter = new Fermenter();
        fermenter.setFermenterId(fermenterId);
        return fermenter;
    }

    public Recipe convertToRecipe(Long recipeId) {
        Recipe recipe = new Recipe();
        recipe.setRecipeId(recipeId);
        return recipe;
    }

}
