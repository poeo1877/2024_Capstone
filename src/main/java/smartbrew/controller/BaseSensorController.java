package smartbrew.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public abstract class BaseSensorController<T> {

    public abstract ResponseEntity<List<T>> getByBatchId(@PathVariable Long batchId);

    public abstract ResponseEntity<List<T>> getByDateRange(@RequestParam("start") Timestamp start, @RequestParam("end") Timestamp end);

    public abstract ResponseEntity<List<T>> getByValueRange(@RequestParam("min") BigDecimal min, @RequestParam("max") BigDecimal max);

    public abstract ResponseEntity<T> postData(@RequestBody T data);


//    @PutMapping("/{id}")
//    public ResponseEntity<T> update(@PathVariable Long id, @RequestBody T dto) {
//        // Implementation to update sensor data
//        return ResponseEntity.ok().build();
//    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        // Implementation to delete sensor data by ID
//        return ResponseEntity.ok().build();
//    }
}
