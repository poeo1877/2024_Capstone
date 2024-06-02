package smartbrew.service;

import smartbrew.domain.FermentationStatus;
import smartbrew.domain.Fermenter;
import smartbrew.dto.FermenterDTO;
import smartbrew.repository.FermenterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FermenterService {

    @Autowired
    private FermenterRepository fermenterRepository;

    public List<FermenterDTO> getAllFermenters() {
        return fermenterRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public FermenterDTO getFermenterById(Long id) {
        return fermenterRepository.findById(id)
                .map(this::convertToDto)
                .orElseThrow(() -> new IllegalArgumentException("Fermenter with ID " + id + " not found"));
    }

    public FermenterDTO createFermenter(FermenterDTO dto) {
        Fermenter fermenter = convertToEntity(dto);
        Fermenter savedFermenter = fermenterRepository.save(fermenter);
        return convertToDto(savedFermenter);
    }

    public FermenterDTO updateFermenter(Long id, FermenterDTO dto) {
        Fermenter fermenter = fermenterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fermenter with ID " + id + " not found"));

        fermenter.setFermenterVolume(dto.getFermenterVolume());
        fermenter.setStatus(dto.getStatus());
        fermenter.setFermenterLine(dto.getFermenterLine());

        Fermenter updatedFermenter = fermenterRepository.save(fermenter);
        return convertToDto(updatedFermenter);
    }

    public void deleteFermenter(Long id) {
        if (!fermenterRepository.existsById(id)) {
            throw new IllegalArgumentException("Fermenter with ID " + id + " not found");
        }
        fermenterRepository.deleteById(id);
    }

    /*public List<FermenterDTO> getFermentersByStatus(FermentationStatus status) {
        List<Fermenter> fermenters = fermenterRepository.findByStatus(status);
        return fermenters.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }*/

    /*
        Enum Type을 최대한 활용해 DBMS로 요청하는 쿼리를 작성하려 했으나 연산자 오류로 해결 불가
        단순히 Fermenter 테이블 값을 전부 불러와서 /fermenters/status의 RequestParam 값을 이용해
        서버에서 값을 필터링하는 방식으로 변경하였다.
        이는 차후에 Fermenter 테이블 값이 많아지면 성능 저하를 야기하니 개선 필요
     */
    public List<FermenterDTO> getFermentersByStatusFiltered(FermentationStatus status) {
        return getAllFermenters().stream()
                .filter(fermenter -> fermenter.getStatus() == status)
                .collect(Collectors.toList());
    }

    public List<FermenterDTO> getFermentersByStatus(String status) {
        FermentationStatus fermentationStatus = FermentationStatus.valueOf(status.toUpperCase());
        List<Fermenter> fermenters = fermenterRepository.findByStatus(fermentationStatus);
        return fermenters.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<String> getDistinctFermenterLines() {
        return fermenterRepository.findDistinctFermenterLines();
    }

    public List<FermenterDTO> getFermentersByLine(String fermenterLine) {
        return fermenterRepository.findByFermenterLine(fermenterLine).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    private FermenterDTO convertToDto(Fermenter fermenter) {
        return new FermenterDTO(
                fermenter.getFermenterId(),
                fermenter.getFermenterVolume(),
                fermenter.getStatus(),
                fermenter.getFermenterLine()
        );
    }

    private Fermenter convertToEntity(FermenterDTO dto) {
        Fermenter fermenter = new Fermenter();
        fermenter.setFermenterId(dto.getFermenterId());
        fermenter.setFermenterVolume(dto.getFermenterVolume());
        fermenter.setStatus(dto.getStatus());
        fermenter.setFermenterLine(dto.getFermenterLine());
        return fermenter;
    }
}
