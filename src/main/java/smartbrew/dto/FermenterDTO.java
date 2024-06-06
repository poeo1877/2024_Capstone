package smartbrew.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import smartbrew.domain.FermentationStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FermenterDTO {
    private Long fermenterId;
    private int fermenterVolume;
    private FermentationStatus status;
    private String fermenterLine;
}