package smartbrew.service;

import smartbrew.domain.Batch;
import smartbrew.domain.FermentationStatus;
import smartbrew.domain.Fermenter;
import smartbrew.dto.BatchDTO;
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
    @Autowired
    private BatchService batchService;

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

    public List<BatchDTO> getBatchesByFermenterStatus(FermentationStatus status) {
        List<Batch> batches = fermenterRepository.findBatchesByFermenterStatus(status.name());
        return batches.stream()
                .map(batchService::convertToDto)
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
