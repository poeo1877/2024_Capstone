package smartbrew;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import smartbrew.repository.JpaMemberRepository;
import smartbrew.repository.MemberRepository;
import smartbrew.repository.MemoryMemberRepository;
import smartbrew.service.MemberService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class SpringConfig {

    private final DataSource dataSource;
    private final EntityManager em;
    public SpringConfig(DataSource dataSource, EntityManager em) {
        this.dataSource = dataSource;
        this.em = em;
    }

    @Bean
    public MemberService memberService() {
        return new MemberService(memberRepository());
    }

    @Bean
    public MemberRepository memberRepository() {

      return new JpaMemberRepository(em);

   }
}