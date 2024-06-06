// RawMaterialDTO.java
package smartbrew.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class RawMaterialDTO {
    private Long rawMaterialId;
    private Timestamp date;
    private String rawMaterialName;
    private String rawMaterialDescription;
    private String supplierName;
    private String rawMaterialUnit;
    private BigDecimal rawMaterialStock;
    private BigDecimal rawMaterialUse;
    private BigDecimal todayStock;

    // Getters and setters

    public Long getRawMaterialId() {
        return rawMaterialId;
    }

    public void setRawMaterialId(Long rawMaterialId) {
        this.rawMaterialId = rawMaterialId;
    }

    public Timestamp getDate() {
        return date;
    }

    public void setDate(Timestamp date) {
        this.date = date;
    }

    public String getRawMaterialName() {
        return rawMaterialName;
    }

    public void setRawMaterialName(String rawMaterialName) {
        this.rawMaterialName = rawMaterialName;
    }

    public String getRawMaterialDescription() {
        return rawMaterialDescription;
    }

    public void setRawMaterialDescription(String rawMaterialDescription) {
        this.rawMaterialDescription = rawMaterialDescription;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getRawMaterialUnit() {
        return rawMaterialUnit;
    }

    public void setRawMaterialUnit(String rawMaterialUnit) {
        this.rawMaterialUnit = rawMaterialUnit;
    }

    public BigDecimal getRawMaterialStock() {
        return rawMaterialStock;
    }

    public void setRawMaterialStock(BigDecimal rawMaterialStock) {
        this.rawMaterialStock = rawMaterialStock;
    }

    public BigDecimal getRawMaterialUse() {
        return rawMaterialUse;
    }

    public void setRawMaterialUse(BigDecimal rawMaterialUse) {
        this.rawMaterialUse = rawMaterialUse;
    }

    public BigDecimal getTodayStock() {
        return todayStock;
    }

    public void setTodayStock(BigDecimal todayStock) {
        this.todayStock = todayStock;
    }
}
