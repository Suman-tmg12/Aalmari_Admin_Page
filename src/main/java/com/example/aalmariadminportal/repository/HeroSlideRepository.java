package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.HeroSlide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeroSlideRepository extends JpaRepository<HeroSlide, Long> {

    // Find all active slides ordered by priority
    List<HeroSlide> findByActiveTrueOrderByPriorityAsc();

    // Find all slides ordered by priority
    List<HeroSlide> findAllByOrderByPriorityAsc();

    // Count active slides
    long countByActiveTrue();
}