package com.example.aalmariadminportal.controller;

import com.example.aalmariadminportal.service.AdminProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    private final AdminProfileService adminProfileService;

    public LoginController(AdminProfileService adminProfileService) {
        this.adminProfileService = adminProfileService;
    }

    @GetMapping("/")
    public String showAdminPage(Authentication authentication, Model model) {
        model.addAttribute("adminAvatarUrl",
                adminProfileService.getAvatarUrl(authentication.getName()));
        return "AdminPage";
    }

    @GetMapping("/login")
    public String showLoginPage() {
        return "LoginPage";
    }

}
