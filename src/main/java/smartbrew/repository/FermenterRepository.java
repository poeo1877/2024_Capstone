package smartbrew.repository;

import smartbrew.domain.FermentationStatus;
import smartbrew.domain.Fermenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface FermenterRepository extends JpaRepository<Fermenter, Long> {
    List<Fermenter> findByStatus(FermentationStatus status);
    @Query("SELECT DISTINCT f.fermenterLine FROM Fermenter f")
    List<String> findDistinctFermenterLines();
    List<Fermenter> findByFermenterLine(String fermenterLine);
}
