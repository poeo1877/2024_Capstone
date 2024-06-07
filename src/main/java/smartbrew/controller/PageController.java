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
}
