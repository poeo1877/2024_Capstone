package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartbrew.domain.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {
}