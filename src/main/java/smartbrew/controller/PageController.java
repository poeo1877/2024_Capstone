package smartbrew.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/dashboard")
    public String getDashboard() {
        return "dashboard";
    }

    @GetMapping("/detailed_data")
    public String getDetailedData() {
        return "detailed_data";
    }

    @GetMapping("/report")
    public String getReportPage() {
        return "report";
    }

    @GetMapping("/report/tax")
    public String taxReport() {
        return "tax-report";
    }

    @GetMapping("/report/production")
    public String productionReport() {
        return "production-report";
    }

    @GetMapping("/report/materials")
    public String materialsReport() {
        return "materials-report";
    }
}
