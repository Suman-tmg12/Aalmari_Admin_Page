package com.example.aalmariadminportal.service;

import com.example.aalmariadminportal.model.HeroSlide;
import com.example.aalmariadminportal.repository.HeroSlideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HeroSlideService {

    @Autowired
    private HeroSlideRepository heroSlideRepository;

    // Get all slides
    public List<HeroSlide> getAllSlides() {
        return heroSlideRepository.findAllByOrderByPriorityAsc();
    }

    // Get active slides only
    public List<HeroSlide> getActiveSlides() {
        return heroSlideRepository.findByActiveTrueOrderByPriorityAsc();
    }

    // Get slide by ID
    public Optional<HeroSlide> getSlideById(Long id) {
        return heroSlideRepository.findById(id);
    }

    // Create new slide
    public HeroSlide createSlide(HeroSlide slide) {
        return heroSlideRepository.save(slide);
    }

    // Update existing slide
    public HeroSlide updateSlide(Long id, HeroSlide slideDetails) {
        Optional<HeroSlide> optionalSlide = heroSlideRepository.findById(id);
        if (optionalSlide.isPresent()) {
            HeroSlide slide = optionalSlide.get();
            slide.setTitle(slideDetails.getTitle());
            slide.setSubtitle(slideDetails.getSubtitle());
            slide.setCtaText(slideDetails.getCtaText());
            slide.setCtaUrl(slideDetails.getCtaUrl());
            slide.setImageUrl(slideDetails.getImageUrl());
            slide.setPriority(slideDetails.getPriority());
            slide.setActive(slideDetails.getActive());
            return heroSlideRepository.save(slide);
        }
        return null;
    }

    // Delete slide
    public void deleteSlide(Long id) {
        heroSlideRepository.deleteById(id);
    }

    // Get count of active slides
    public long getActiveSlideCount() {
        return heroSlideRepository.countByActiveTrue();
    }
}