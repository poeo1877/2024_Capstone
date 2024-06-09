package smartbrew.raspberry;

import lombok.Data;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import smartbrew.dto.SensorMeasurementDTO;

@RestController
@RequestMapping("/sensor")
public class RaspberrySensorController {

    @PostMapping("/update")
    public String updateSensor(@RequestBody SensorMeasurementDTO dto) {

        System.out.println("Received temperature: " + dto);
        return dto.toString();
    }

    @PostMapping("/temp/update")
    public String updateTemperature(@RequestBody SensorMeasurementDTO dto) {
        // 온도 데이터를 처리합니다 (예: 저장, 로깅 등)
        System.out.println("Received temperature: " + dto);
        return "Temperature updated";
    }

    public static class TemperatureRequest {
        private double temperature;

        public double getTemperature() {
            return temperature;
        }

        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }
    }
    @PostMapping("/co2/update")
    public String updateCo2(@RequestBody Co2Request request) {
        // 온도 데이터를 처리합니다 (예: 저장, 로깅 등)
        System.out.println("Received Co2: " + request.getCo2() + " ppm");
        return "Co2 updated";
    }

    public static class Co2Request {
        private double co2;

        public double getCo2() {
            return co2;
        }

        public void setCo2(double co2) {
            this.co2 = co2;
        }
    }
    @PostMapping("/press/update")
    public String updatePress(@RequestBody SensorMeasurementDTO dto) {
        // 온도 데이터를 처리합니다 (예: 저장, 로깅 등)

        System.out.println("Received Press: " + dto);

        return "Press updated";
    }

}


