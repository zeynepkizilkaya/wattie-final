package com.i2i.wattie.home.repository;

import com.i2i.wattie.home.entity.Appliance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplianceRepository extends JpaRepository<Appliance, Long> {
    List<Appliance> findByHomeId(Long homeId);
}