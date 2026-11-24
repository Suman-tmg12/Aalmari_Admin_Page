package com.example.aalmariadminportal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "commission_settings")
public class CommissionSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 50)
    private String settingKey = "platform";

    @Column(name = "commission_percent", nullable = false)
    private Double commissionPercent;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }

    public Double getCommissionPercent() { return commissionPercent; }
    public void setCommissionPercent(Double commissionPercent) { this.commissionPercent = commissionPercent; }
}

