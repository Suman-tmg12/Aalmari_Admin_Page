package com.example.aalmariadminportal.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_profiles")
public class AdminProfile {

    @Id
    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "avatar_url", nullable = false, length = 2048)
    private String avatarUrl;

    protected AdminProfile() {
    }

    public AdminProfile(String username, String avatarUrl) {
        this.username = username;
        this.avatarUrl = avatarUrl;
    }

    public String getUsername() {
        return username;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
