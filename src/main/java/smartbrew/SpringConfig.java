package smartbrew;

import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import smartbrew.repository.JpaMemberRepository;
import smartbrew.repository.MemberRepository;
import smartbrew.repository.MemoryMemberRepository;
import smartbrew.service.MemberService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringConfig {


    private final MemberRepository memberRepository;

    public SpringConfig(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    @Bean
    public MemberService memberService() {
        return new MemberService(memberRepository);
    }

//    @Bean
//    public MemberRepository memberRepository() {
//
//         return new JpaMemberRepository(em);
//
//    }
}