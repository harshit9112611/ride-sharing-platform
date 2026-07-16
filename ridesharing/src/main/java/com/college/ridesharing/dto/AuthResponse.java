package com.college.ridesharing.dto;

public class AuthResponse {

    private String token;
    private String fullName;
    private String collegeEmail;
    private Long userId;

    public AuthResponse() {
    }

    public AuthResponse(String token, String fullName, String collegeEmail, Long userId) {
        this.token = token;
        this.fullName = fullName;
        this.collegeEmail = collegeEmail;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCollegeEmail() {
        return collegeEmail;
    }

    public void setCollegeEmail(String collegeEmail) {
        this.collegeEmail = collegeEmail;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
