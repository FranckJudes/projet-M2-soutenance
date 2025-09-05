package com.harmony.harmoniservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@SpringBootApplication
@EnableAsync
public class HarmoniServicesApplication {

    public static void main(String[] args) {
        SpringApplication.run(HarmoniServicesApplication.class, args);
    }

    // @Bean(name = "taskExecutor")
    // public Executor taskExecutor() {
    //     ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    //     executor.setCorePoolSize(5);
    //     executor.setMaxPoolSize(10);
    //     executor.setQueueCapacity(500);
    //     executor.setThreadNamePrefix("Async-");
    //     executor.initialize();
    //     return executor;
    // }

}
