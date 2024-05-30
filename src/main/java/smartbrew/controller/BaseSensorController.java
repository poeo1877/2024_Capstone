package smartbrew.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.List;

public interface BaseSensorController<T> {

    ResponseEntity<List<T>> getByBatchId(@PathVariable Long batchId);

    ResponseEntity<List<T>> getByDateRange(@RequestParam(value = "start", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String startStr,
                                           @RequestParam(value = "end", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) String endStr);

    ResponseEntity<List<T>> getByValueRange(@RequestParam(value = "min", required = false) BigDecimal min,
                                            @RequestParam(value = "max", required = false) BigDecimal max);

    ResponseEntity<T> postData(@RequestBody T data);
}
