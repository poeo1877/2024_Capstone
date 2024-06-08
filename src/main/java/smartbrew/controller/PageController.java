package smartbrew.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import smartbrew.component.CurrentBatchComponent;
import smartbrew.service.BatchService;
import smartbrew.service.SensorMeasurementService;

import java.util.Map;

@Controller
public class PageController {
    @Autowired
    private SensorMeasurementService sensorMeasurementService;
    @Autowired
    private BatchService batchService;

    @Autowired
    private CurrentBatchComponent currentBatchComponent;

    @GetMapping("/")
    public String getDashboard(Model model) {
        try {
            Map<String, Object> dataWithChanges = sensorMeasurementService.getLatestSensorDataWithChanges();
            model.addAttribute("latest", dataWithChanges.get("latest"));
            model.addAttribute("changes", dataWithChanges.get("changes"));
            model.addAttribute("batchName", batchService.getBatchName(currentBatchComponent.getCurrentBatchId()));
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "index";
    }

    @GetMapping("/detail-data")
    public String getDetailedData(Model model) {
        try {
            Long batchId = currentBatchComponent.getCurrentBatchId();
            model.addAttribute("sensorData", sensorMeasurementService.getMeasurementsByBatchId(batchId));
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "detail-data";
    }

    @GetMapping("/report")
    public String getReport(Model model) {
        try {
//            model.addAttribute("reportData", sensorMeasurementService.getReportData());
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
        }
        return "report";
    }
}
