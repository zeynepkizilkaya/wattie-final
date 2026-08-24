package com.i2i.wattie.home.repository;

import com.i2i.wattie.home.entity.ConsumptionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ConsumptionSnapshotRepository extends JpaRepository<ConsumptionSnapshot, Long> {
    List<ConsumptionSnapshot> findByHomeIdOrderBySnapshotDateAsc(Long homeId);
}