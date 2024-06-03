package smartbrew.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smartbrew.dto.RawMaterialDTO;
import smartbrew.domain.RawMaterial;
import smartbrew.domain.RawMaterialReceipt;
import smartbrew.repository.RawMaterialReceiptRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class RawMaterialReceiptService {

    private final RawMaterialReceiptRepository rawMaterialReceiptRepository;

    @Autowired
    public RawMaterialReceiptService(RawMaterialReceiptRepository rawMaterialReceiptRepository) {
        this.rawMaterialReceiptRepository = rawMaterialReceiptRepository;
    }

    public List<RawMaterialDTO> getAllRawMaterialDTOs() {
        List<Object[]> rawMaterialData = rawMaterialReceiptRepository.findAllWithRawMaterialInfo();

        // 각 raw_material_id 별 누적 todayStock 저장
        Map<Long, BigDecimal> cumulativeTodayStockMap = new HashMap<>();

        return rawMaterialData.stream()
                .map(objects -> {
                    RawMaterialDTO dto = convertToDTO(objects, cumulativeTodayStockMap);
                    Long rawMaterialId = dto.getRawMaterialId();
                    BigDecimal newStock = cumulativeTodayStockMap.getOrDefault(rawMaterialId, BigDecimal.ZERO).add(dto.getRawMaterialStock());
                    cumulativeTodayStockMap.put(rawMaterialId, newStock);
                    dto.setTodayStock(newStock);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public RawMaterialDTO saveReceipt(RawMaterialReceipt receipt) {
        RawMaterialReceipt savedReceipt = rawMaterialReceiptRepository.save(receipt);
        return convertToDTO(new Object[]{savedReceipt, savedReceipt.getRawMaterial()}, new HashMap<>());
    }

    private RawMaterialDTO convertToDTO(Object[] objects, Map<Long, BigDecimal> cumulativeTodayStockMap) {
        RawMaterialReceipt rawMaterialReceipt = (RawMaterialReceipt) objects[0];
        RawMaterial rawMaterial = (RawMaterial) objects[1];

        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setRawMaterialId(rawMaterial.getRawMaterialId());
        dto.setDate(rawMaterialReceipt.getCreatedAt());
        dto.setRawMaterialName(rawMaterial.getRawMaterialName());
        dto.setRawMaterialDescription(rawMaterial.getDescription());
        dto.setSupplierName(rawMaterial.getSupplierName());
        dto.setRawMaterialUnit(rawMaterial.getUnit());
        dto.setRawMaterialStock(rawMaterialReceipt.getQuantity());
        dto.setRawMaterialUse(BigDecimal.ZERO); // 필요시 업데이트

        // raw_material_id에 해당하는 누적 today_stock 계산
        Long rawMaterialId = rawMaterial.getRawMaterialId();
        BigDecimal cumulativeTodayStock = cumulativeTodayStockMap.getOrDefault(rawMaterialId, BigDecimal.ZERO);
        BigDecimal todayStock = cumulativeTodayStock.add(rawMaterialReceipt.getQuantity());
        dto.setTodayStock(todayStock);

        return dto;
    }
}
