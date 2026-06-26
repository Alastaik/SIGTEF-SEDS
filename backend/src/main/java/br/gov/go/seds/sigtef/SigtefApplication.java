package br.gov.go.seds.sigtef;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SigtefApplication {

	public static void main(String[] args) {
		SpringApplication.run(SigtefApplication.class, args);
	}

}
