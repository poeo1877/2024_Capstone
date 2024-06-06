// RawMaterialReceiptDTO.java
package smartbrew.dto;

import java.math.BigDecimal;

public class RawMaterialReceiptDTO {
    private Long rawMaterialId;
    private BigDecimal quantity;
    private int unitPrice;

    // Getters and setters
    public Long getRawMaterialId() {
        return rawMaterialId;
    }

    public void setRawMaterialId(Long rawMaterialId) {
        this.rawMaterialId = rawMaterialId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public int getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(int unitPrice) {
        this.unitPrice = unitPrice;
    }

    public RawMaterialDTO getRawMaterial() {
        RawMaterialDTO rawMaterial = new RawMaterialDTO();
        return rawMaterial;

    }
}
