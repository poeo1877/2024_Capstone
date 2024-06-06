package smartbrew.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.sql.Timestamp;

@Entity
public class Batch {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private final long batchId;
    private final Timestamp startTime;
    private final Timestamp endTime;
    private final String recipeRatio;
    private final int recipeId;
    private final int fermenterId;

    // Parameterized constructor
    public Batch(long batchId, Timestamp startTime, Timestamp endTime, String recipeRatio, int recipeId, int fermenterId) {
        this.batchId = batchId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.recipeRatio = recipeRatio;
        this.recipeId = recipeId;
        this.fermenterId = fermenterId;
    }

    // Getter methods
    public long getBatchId() {
        return batchId;
    }
    public Timestamp getStartTime() {
        return startTime;
    }
    public Timestamp getEndTime() {
        return endTime;
    }
    public String getRecipeRatio() {
        return recipeRatio;
    }
    public int getRecipeId() {
        return recipeId;
    }
    public int getFermenterId() {
        return fermenterId;
    }
}
