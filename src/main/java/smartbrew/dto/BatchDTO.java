package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchDTO {
    private Long batchId;
    private Timestamp startTime;
    private Timestamp endTime;
    private String recipeRatio;
    private Long fermenterId;
    private Long recipeId;
    private String recipeName;
}
