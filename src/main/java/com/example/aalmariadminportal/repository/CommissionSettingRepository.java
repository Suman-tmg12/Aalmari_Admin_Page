package com.example.aalmariadminportal.repository;

import com.example.aalmariadminportal.model.CommissionSetting;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommissionSettingRepository extends JpaRepository<CommissionSetting, Long> {
    Optional<CommissionSetting> findBySettingKey(String settingKey);
}

