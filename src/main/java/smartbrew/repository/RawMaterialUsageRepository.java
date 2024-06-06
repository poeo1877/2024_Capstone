package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import smartbrew.domain.RawMaterialUsage;

public interface RawMaterialUsageRepository extends JpaRepository<RawMaterialUsage, Long> {
}
