package smartbrew.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashBoardController {

    @GetMapping("/DashBoard")
    public String getDashboard() {
        return "dashboard";  // dashboard.html 파일을 반환
    }

}
