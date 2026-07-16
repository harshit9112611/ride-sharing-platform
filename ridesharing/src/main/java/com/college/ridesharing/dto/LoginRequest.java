package com.college.ridesharing.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "College email is required")
    @Email(message = "Invalid email format")
    private String collegeEmail;

    @NotBlank(message = "Password is required")
    private String password;

    public LoginRequest() {
    }

    public String getCollegeEmail() {
        return collegeEmail;
    }

    public void setCollegeEmail(String collegeEmail) {
        this.collegeEmail = collegeEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
