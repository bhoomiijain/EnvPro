package com.envpro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EnvProApplication {

  public static void main(String[] args) {
    SpringApplication.run(EnvProApplication.class, args);
  }
}
