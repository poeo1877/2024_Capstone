package smartbrew.repository;

import smartbrew.domain.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByStartTime(Timestamp start);
    List<Batch> findByFermenterFermenterIdIn(List<Long> fermenterIds);  // Correct method name
    List<Batch> findByStartTimeAndFermenterFermenterIdIn(Timestamp start, List<Long> fermenterIds);  // Correct method name
}
