package smartbrew.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.service.BatchService;
import smartbrew.service.SensorMeasurementService;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Map;

@Controller
public class MyController {

    @Autowired
    private SensorMeasurementService sensorMeasurementService;
    @Autowired
    private BatchService batchService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("message", "Hello, Thymeleaf!");
        model.addAttribute("currentDate", LocalDate.now());
        model.addAttribute("items", Arrays.asList("Item 1", "Item 2", "Item 3"));
        return "index";
    }


    @GetMapping("/dashboard")
    public String getDashboard(Model model) {
        try {
            Map<String, Object> dataWithChanges = sensorMeasurementService.getLatestSensorDataWithChanges();
            model.addAttribute("latest", dataWithChanges.get("latest"));
            model.addAttribute("changes", dataWithChanges.get("changes"));
            model.addAttribute("batchName", batchService.getBatchName(currentBatchComponent.getCurrentBatchId()));
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "dashboard";
    }

}
