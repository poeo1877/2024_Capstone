package smartbrew.service;

import smartbrew.domain.RawMaterial;
import smartbrew.domain.RawMaterialReceipt;
import smartbrew.dto.MaterialReceiptreportDTO;
import smartbrew.dto.MaterialreportDTO;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.dto.RawMaterialReceiptDTO;
import smartbrew.repository.RawMaterialReceiptRepository;
import smartbrew.repository.RawMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;

@Service
public class RawMaterialService {

    private final RawMaterialRepository rawMaterialRepository;
    private final RawMaterialReceiptRepository rawMaterialReceiptRepository;

    @Autowired
    public RawMaterialService(RawMaterialRepository rawMaterialRepository, RawMaterialReceiptRepository rawMaterialReceiptRepository) {
        this.rawMaterialRepository = rawMaterialRepository;
        this.rawMaterialReceiptRepository = rawMaterialReceiptRepository;
    }

    @Transactional
    public void addRawMaterialAndReceipt(MaterialreportDTO rawMaterialDTO, MaterialReceiptreportDTO receiptDTO) {
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.setRawMaterialName(rawMaterialDTO.getRawMaterialName());
        rawMaterial.setCategory(rawMaterialDTO.getCategory());
        rawMaterial.setDescription(rawMaterialDTO.getDescription());
        rawMaterial.setUnit(rawMaterialDTO.getUnit());
        rawMaterial.setSupplierName(rawMaterialDTO.getSupplierName());
        rawMaterial.setPhoneNumber(rawMaterialDTO.getPhoneNumber());
        rawMaterial.setZipCode(rawMaterialDTO.getZipCode());
        rawMaterial.setTodayStock(receiptDTO.getQuantity());

        rawMaterial = rawMaterialRepository.save(rawMaterial);

        RawMaterialReceipt receipt = new RawMaterialReceipt();
        receipt.setRawMaterial(rawMaterial);
        receipt.setQuantity(receiptDTO.getQuantity());
        receipt.setUnitPrice(receiptDTO.getUnitPrice());
        receipt.setCreatedAt(new Timestamp(System.currentTimeMillis()));

        rawMaterialReceiptRepository.save(receipt);
    }
}
