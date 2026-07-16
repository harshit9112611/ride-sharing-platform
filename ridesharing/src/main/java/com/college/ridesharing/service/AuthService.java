package com.college.ridesharing.service;

import com.college.ridesharing.config.JwtTokenProvider;
import com.college.ridesharing.dto.AuthResponse;
import com.college.ridesharing.dto.LoginRequest;
import com.college.ridesharing.dto.RegisterRequest;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.UserRepository;
import java.time.LocalDateTime;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByCollegeEmail(request.getCollegeEmail())) {
            throw new IllegalArgumentException("College email already registered");
        }
        if (userRepository.existsByEnrollmentNumber(request.getEnrollmentNumber())) {
            throw new IllegalArgumentException("Enrollment number already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setCollegeEmail(request.getCollegeEmail());
        user.setEnrollmentNumber(request.getEnrollmentNumber());
        user.setBranch(request.getBranch());
        user.setAcademicYear(request.getAcademicYear());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRating(0.0);
        user.setTotalRides(0);
        user.setVerified(false);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getCollegeEmail());

        return new AuthResponse(
                token,
                savedUser.getFullName(),
                savedUser.getCollegeEmail(),
                savedUser.getId());
    }

    public AuthResponse authenticate(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getCollegeEmail(),
                        request.getPassword()));

        User user = userRepository.findByCollegeEmail(request.getCollegeEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtTokenProvider.generateToken(user.getCollegeEmail());

        return new AuthResponse(
                token,
                user.getFullName(),
                user.getCollegeEmail(),
                user.getId());
    }

    public User getProfile(String collegeEmail) {
        return userRepository.findByCollegeEmail(collegeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Transactional
    public User updateProfile(String collegeEmail, String fullName, String phoneNumber, String branch, Integer academicYear) {
        User user = getProfile(collegeEmail);
        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName);
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            user.setPhoneNumber(phoneNumber);
        }
        if (branch != null && !branch.isBlank()) {
            user.setBranch(branch);
        }
        if (academicYear != null) {
            user.setAcademicYear(academicYear);
        }
        return userRepository.save(user);
    }
}
