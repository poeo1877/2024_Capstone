package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartbrew.domain.SalesDetail;

public interface SalesDetailRepository extends JpaRepository<SalesDetail, Long> {
}
