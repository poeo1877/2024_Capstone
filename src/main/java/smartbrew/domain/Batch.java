package smartbrew.domain;

import jakarta.annotation.sql.DataSourceDefinitions;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Entity
@Data
public class Batch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long batchId;

    private Timestamp startTime = new Timestamp(System.currentTimeMillis());
    private Timestamp endTime;
    private String recipeRatio = "1.0";

    @ManyToOne
    @JoinColumn(name = "recipe_id", referencedColumnName = "recipeId")
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "fermenter_id", referencedColumnName = "fermenterId")
    private Fermenter fermenter;
}
