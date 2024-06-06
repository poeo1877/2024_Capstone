package smartbrew.service;

import smartbrew.domain.RawMaterial;
import smartbrew.domain.RawMaterialReceipt;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.dto.RawMaterialReceiptDTO;
import smartbrew.repository.RawMaterialReceiptRepository;
import smartbrew.repository.RawMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.Serializable;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final RawMaterialReceiptRepository rawMaterialReceiptRepository;

    @Autowired
    public RawMaterialService(RawMaterialRepository rawMaterialRepository, RawMaterialReceiptRepository rawMaterialReceiptRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
        this.rawMaterialReceiptRepository = rawMaterialReceiptRepository;
    }

    public RawMaterial saveRawMaterial(RawMaterial rawMaterial) {
        return rawMaterialRepository.save(rawMaterial);
    }

    public List<RawMaterial> findAllRawMaterials() {
        return rawMaterialRepository.findAll();
    }

    public Optional<RawMaterial> findRawMaterialById(Long id) {
        return rawMaterialRepository.findById(id);
    }

    public List<RawMaterialDTO> findAllRawMaterialDTOs() {
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();
        return rawMaterials.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void addRawMaterialReceipt(RawMaterialReceiptDTO receiptDTO) {
        Optional<RawMaterial> rawMaterialOpt = rawMaterialRepository.findById(receiptDTO.getRawMaterial().getRawMaterialId());
        if (rawMaterialOpt.isPresent()) {
            RawMaterial rawMaterial = rawMaterialOpt.get();

            // Save to raw_material_receipt table
            RawMaterialReceipt receipt = new RawMaterialReceipt();
            receipt.setRawMaterial(rawMaterial);
            receipt.setQuantity(receiptDTO.getQuantity());
            receipt.setUnitPrice(receiptDTO.getUnitPrice());
            receipt.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            rawMaterialReceiptRepository.save(receipt);

            // Update today_stock in raw_material table
            Serializable newTodayStock = rawMaterial.getTodayStock() == null ? receiptDTO.getQuantity() : rawMaterial.getTodayStock().add(receiptDTO.getQuantity());
            rawMaterial.setTodayStock((BigDecimal) newTodayStock);
            rawMaterial.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
            rawMaterialRepository.save(rawMaterial);
        } else {
            throw new IllegalArgumentException("Raw material not found");
        }
    }

    private RawMaterialDTO convertToDTO(RawMaterial rawMaterial) {
        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setDate(rawMaterial.getCreatedAt());
        dto.setRawMaterialName(rawMaterial.getRawMaterialName());
        dto.setRawMaterialDescription(rawMaterial.getDescription());
        dto.setSupplierName(rawMaterial.getSupplierName());
        dto.setRawMaterialUnit(rawMaterial.getUnit());

        // Get the latest RawMaterialReceipt for the given RawMaterial
        List<RawMaterialReceipt> receipts = rawMaterialReceiptRepository.findByRawMaterial_RawMaterialId(rawMaterial.getRawMaterialId());
        if (!receipts.isEmpty()) {
            RawMaterialReceipt latestReceipt = receipts.get(receipts.size() - 1); // Get the latest receipt
            dto.setRawMaterialStock(latestReceipt.getQuantity());
        } else {
            dto.setRawMaterialStock(BigDecimal.ZERO);
        }

        dto.setRawMaterialUse(rawMaterial.getRawMaterialUse());
        dto.setTodayStock(rawMaterial.getTodayStock());
        return dto;
    }
}
