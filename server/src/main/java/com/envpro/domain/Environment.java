package com.envpro.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "environments")
public class Environment {

  @Id private UUID id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Column(name = "env_key", nullable = false, unique = true)
  private String envKey;

  @Column(nullable = false)
  private String branch;

  @Column(name = "commit_sha", nullable = false)
  private String commitSha;

  @Column(name = "commit_message")
  private String commitMessage;

  private String author;

  @Column(nullable = false)
  private String status;

  @Column(nullable = false)
  private String health;

  @Column(name = "preview_url")
  private String previewUrl;

  private Integer port;

  @Column(name = "ttl_seconds", nullable = false)
  private int ttlSeconds;

  @Column(name = "auto_destroy_at")
  private Instant autoDestroyAt;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt = Instant.now();

  @Column(name = "healthy_at")
  private Instant healthyAt;

  @Column(name = "destroyed_at")
  private Instant destroyedAt;

  @Column(name = "docker_image")
  private String dockerImage;

  @Column(name = "cpu_percent", precision = 5, scale = 2)
  private BigDecimal cpuPercent = BigDecimal.ZERO;

  @Column(name = "ram_percent", precision = 5, scale = 2)
  private BigDecimal ramPercent = BigDecimal.ZERO;

  @Column(name = "ram_mb")
  private Integer ramMb = 512;

  @Column(name = "latest_failure_cause")
  private String latestFailureCause;

  @Column(name = "tests_passed")
  private Integer testsPassed = 0;

  @Column(name = "tests_failed")
  private Integer testsFailed = 0;

  @Column(name = "image_size_label")
  private String imageSizeLabel;

  @Column(name = "build_duration_seconds")
  private Integer buildDurationSeconds;

  @Column(name = "build_stage")
  private String buildStage;

  @OneToMany(mappedBy = "environment", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("createdAt DESC")
  private List<EnvironmentRevision> revisions = new ArrayList<>();

  @OneToMany(mappedBy = "environment", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("createdAt DESC")
  private List<EnvironmentEvent> events = new ArrayList<>();

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public Project getProject() {
    return project;
  }

  public void setProject(Project project) {
    this.project = project;
  }

  public String getEnvKey() {
    return envKey;
  }

  public void setEnvKey(String envKey) {
    this.envKey = envKey;
  }

  public String getBranch() {
    return branch;
  }

  public void setBranch(String branch) {
    this.branch = branch;
  }

  public String getCommitSha() {
    return commitSha;
  }

  public void setCommitSha(String commitSha) {
    this.commitSha = commitSha;
  }

  public String getCommitMessage() {
    return commitMessage;
  }

  public void setCommitMessage(String commitMessage) {
    this.commitMessage = commitMessage;
  }

  public String getAuthor() {
    return author;
  }

  public void setAuthor(String author) {
    this.author = author;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getHealth() {
    return health;
  }

  public void setHealth(String health) {
    this.health = health;
  }

  public String getPreviewUrl() {
    return previewUrl;
  }

  public void setPreviewUrl(String previewUrl) {
    this.previewUrl = previewUrl;
  }

  public Integer getPort() {
    return port;
  }

  public void setPort(Integer port) {
    this.port = port;
  }

  public int getTtlSeconds() {
    return ttlSeconds;
  }

  public void setTtlSeconds(int ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
  }

  public Instant getAutoDestroyAt() {
    return autoDestroyAt;
  }

  public void setAutoDestroyAt(Instant autoDestroyAt) {
    this.autoDestroyAt = autoDestroyAt;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getHealthyAt() {
    return healthyAt;
  }

  public void setHealthyAt(Instant healthyAt) {
    this.healthyAt = healthyAt;
  }

  public Instant getDestroyedAt() {
    return destroyedAt;
  }

  public void setDestroyedAt(Instant destroyedAt) {
    this.destroyedAt = destroyedAt;
  }

  public String getDockerImage() {
    return dockerImage;
  }

  public void setDockerImage(String dockerImage) {
    this.dockerImage = dockerImage;
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

  public Integer getRamMb() {
    return ramMb;
  }

  public void setRamMb(Integer ramMb) {
    this.ramMb = ramMb;
  }

  public String getLatestFailureCause() {
    return latestFailureCause;
  }

  public void setLatestFailureCause(String latestFailureCause) {
    this.latestFailureCause = latestFailureCause;
  }

  public Integer getTestsPassed() {
    return testsPassed;
  }

  public void setTestsPassed(Integer testsPassed) {
    this.testsPassed = testsPassed;
  }

  public Integer getTestsFailed() {
    return testsFailed;
  }

  public void setTestsFailed(Integer testsFailed) {
    this.testsFailed = testsFailed;
  }

  public String getImageSizeLabel() {
    return imageSizeLabel;
  }

  public void setImageSizeLabel(String imageSizeLabel) {
    this.imageSizeLabel = imageSizeLabel;
  }

  public Integer getBuildDurationSeconds() {
    return buildDurationSeconds;
  }

  public void setBuildDurationSeconds(Integer buildDurationSeconds) {
    this.buildDurationSeconds = buildDurationSeconds;
  }

  public String getBuildStage() {
    return buildStage;
  }

  public void setBuildStage(String buildStage) {
    this.buildStage = buildStage;
  }

  public List<EnvironmentRevision> getRevisions() {
    return revisions;
  }

  public List<EnvironmentEvent> getEvents() {
    return events;
  }

  public void addRevision(EnvironmentRevision r) {
    r.setEnvironment(this);
    revisions.add(r);
  }

  public void addEvent(EnvironmentEvent e) {
    e.setEnvironment(this);
    events.add(e);
  }
}
