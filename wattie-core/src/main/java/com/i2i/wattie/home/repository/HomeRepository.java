package com.i2i.wattie.home.repository;

import com.i2i.wattie.home.entity.Home;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeRepository extends JpaRepository<Home, Long> {
}