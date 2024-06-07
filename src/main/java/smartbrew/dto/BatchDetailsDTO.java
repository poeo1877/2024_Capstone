package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import smartbrew.domain.Batch;
import smartbrew.domain.Fermenter;
import smartbrew.domain.Recipe;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchDetailsDTO {
    private Batch batch;
    private Recipe recipe;
    private Fermenter fermenter;
}
