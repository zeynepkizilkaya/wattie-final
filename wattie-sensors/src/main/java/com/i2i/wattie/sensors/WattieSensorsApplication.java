package com.i2i.wattie.sensors;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class WattieSensorsApplication {

    public static void main(String[] args) {
        SpringApplication.run(WattieSensorsApplication.class, args);
    }
}