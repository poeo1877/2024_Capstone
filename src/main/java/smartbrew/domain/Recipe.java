package smartbrew.domain;
import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "recipe")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recipe_id")
    private Long recipeId;

    @Column(name = "created_at", nullable = false)
    private Timestamp createdAt = new Timestamp(System.currentTimeMillis());

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "recipe_detail")
    private String recipeDetail;

    @Column(name = "recipe_name", nullable = false, length = 100)
    private String recipeName;

    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;
}