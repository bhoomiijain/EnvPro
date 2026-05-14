package com.envpro.repo;

import com.envpro.domain.Environment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnvironmentRepository extends JpaRepository<Environment, UUID> {

  List<Environment> findAllByProject_IdOrderByCreatedAtDesc(UUID projectId);

  Optional<Environment> findByEnvKey(String envKey);
}
