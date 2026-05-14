package com.envpro.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "resource_samples")
public class ResourceSample {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "environment_id", nullable = false)
  private Environment environment;

  @Column(name = "cpu_percent", nullable = false, precision = 5, scale = 2)
  private BigDecimal cpuPercent;

  @Column(name = "ram_percent", nullable = false, precision = 5, scale = 2)
  private BigDecimal ramPercent;

  @Column(name = "sampled_at", nullable = false)
  private Instant sampledAt = Instant.now();

  public Long getId() {
    return id;
  }

  public Environment getEnvironment() {
    return environment;
  }

  public void setEnvironment(Environment environment) {
    this.environment = environment;
  }

  public BigDecimal getCpuPercent() {
    return cpuPercent;
  }

  public void setCpuPercent(BigDecimal cpuPercent) {
    this.cpuPercent = cpuPercent;
  }

  public BigDecimal getRamPercent() {
    return ramPercent;
  }

  public void setRamPercent(BigDecimal ramPercent) {
    this.ramPercent = ramPercent;
  }

  public Instant getSampledAt() {
    return sampledAt;
  }

  public void setSampledAt(Instant sampledAt) {
    this.sampledAt = sampledAt;
  }
}
