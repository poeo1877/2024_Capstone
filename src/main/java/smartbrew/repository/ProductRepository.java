package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartbrew.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}