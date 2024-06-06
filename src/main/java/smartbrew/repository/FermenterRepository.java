package smartbrew.repository;

import org.springframework.data.repository.query.Param;
import smartbrew.domain.Batch;
import smartbrew.domain.FermentationStatus;
import smartbrew.domain.Fermenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface FermenterRepository extends JpaRepository<Fermenter, Long> {
    @Query("SELECT DISTINCT f.fermenterLine FROM Fermenter f")
    List<String> findDistinctFermenterLines();
    List<Fermenter> findByFermenterLine(String fermenterLine);

    @Query("SELECT b FROM Batch b JOIN b.fermenter f WHERE CAST(f.status AS string) = :status")
    List<Batch> findBatchesByFermenterStatus(@Param("status") String status);

//    @Query("SELECT b.batchId FROM Batch b JOIN b.fermenter f WHERE f.status = 'FERMENTING'")
//    Long findBatchIdByFermenterStatusFermenting();
    @Query("SELECT b.batchId FROM Batch b WHERE b.fermenter.status = 'FERMENTING'")
    Long findBatchIdByFermenterStatusFermenting();
}
