package com.envpro.repo;

import com.envpro.domain.LogEntry;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {

  List<LogEntry> findByEnvironment_Project_IdOrderByCreatedAtDesc(UUID projectId, Pageable pageable);
}
