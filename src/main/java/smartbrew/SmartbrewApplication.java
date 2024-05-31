package smartbrew;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.TimeZone;

@SpringBootApplication
public class SmartbrewApplication {

	@PostConstruct
	public void init() {
		// Setting the default time zone to KST
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}
	public static void main(String[] args) {
		SpringApplication.run(SmartbrewApplication.class, args);

		// 서버의 시간이 서울인지 확인하는 코드 입니다.
		LocalDateTime now = LocalDateTime.now();
		System.out.println("Server Current Time: " + now);
	}

}
