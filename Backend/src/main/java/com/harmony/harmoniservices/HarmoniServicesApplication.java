package com.harmony.harmoniservices;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableCaching
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
