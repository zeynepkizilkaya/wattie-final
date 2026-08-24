package com.i2i.wattie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class WattieCoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(WattieCoreApplication.class, args);
	}
}