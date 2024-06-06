package smartbrew.dto;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class productDTO {
    private int id;
    private Timestamp complete_time;
    private String product_name;
    private String batch_id;
    private BigDecimal inTemperature_average = BigDecimal.ZERO;
    private BigDecimal outTemperature_average = BigDecimal.ZERO;

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Timestamp getComplete_time() {
        return complete_time;
    }

    public void setComplete_time(Timestamp complete_time) {
        this.complete_time = complete_time;
    }

    public String getProduct_name() {
        return product_name;
    }

    public void setProduct_name(String product_name) {
        this.product_name = product_name;
    }

    public String getBatch_id() {
        return batch_id;
    }

    public void setBatch_id(String batch_id) {
        this.batch_id = batch_id;
    }

    public BigDecimal getInTemperature_average() {
        return inTemperature_average;
    }

    public void setInTemperature_average(BigDecimal inTemperature_average) {
        this.inTemperature_average = inTemperature_average;
    }

    public BigDecimal getOutTemperature_average() {
        return outTemperature_average;
    }

    public void setOutTemperature_average(BigDecimal outTemperature_average) {
        this.outTemperature_average = outTemperature_average;
    }
}
