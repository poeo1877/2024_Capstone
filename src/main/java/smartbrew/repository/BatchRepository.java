package smartbrew.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import smartbrew.domain.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByEndTimeBeforeOrderByEndTimeDesc(Timestamp endTime);
    List<Batch> findByStartTimeAfterOrderByStartTimeAsc(Timestamp startTime);

    List<Batch> findByRecipe_RecipeId(Long recipeId);
    List<Batch> findByFermenter_FermenterId(Long fermenterId);

    @Query("SELECT b FROM Batch b WHERE (b.startTime >= :start) AND (b.endTime <= :end) ORDER BY b.startTime ASC")
    List<Batch> findByDateRange(@Param("start") Timestamp start, @Param("end") Timestamp end);



}
