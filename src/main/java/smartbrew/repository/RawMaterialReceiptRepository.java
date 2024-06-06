// RawMaterialReceiptRepository.java
package smartbrew.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import smartbrew.domain.RawMaterialReceipt;

import java.util.List;

@Repository
public interface RawMaterialReceiptRepository extends JpaRepository<RawMaterialReceipt, Long> {

    @Query("SELECT rmr, rm FROM RawMaterialReceipt rmr JOIN rmr.rawMaterial rm ORDER BY rmr.receiptId")
    List<Object[]> findAllWithRawMaterialInfo();

    List<RawMaterialReceipt> findByRawMaterial_RawMaterialId(Long rawMaterialId);
}
