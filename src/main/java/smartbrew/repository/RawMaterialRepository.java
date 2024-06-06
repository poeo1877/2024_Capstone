// RawMaterialRepository.java
package smartbrew.repository;

import smartbrew.domain.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
}
