package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartbrew.domain.Batch;

public interface BatchRepository extends JpaRepository<Batch, Long> {


}
