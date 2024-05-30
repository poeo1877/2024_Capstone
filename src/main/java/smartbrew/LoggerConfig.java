package smartbrew;
//package smartbrew.config; 나중에 config 파일이 많아지면 폴더 새로 하나 만듦

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LoggerConfig {

    @Bean
    public Logger logger() {
        return LoggerFactory.getLogger("SmartBrewLogger");
    }
}
