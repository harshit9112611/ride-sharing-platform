package com.college.ridesharing.service;

import com.college.ridesharing.config.JwtTokenProvider;
import com.college.ridesharing.dto.AuthResponse;
import com.college.ridesharing.dto.LoginRequest;
import com.college.ridesharing.dto.RegisterRequest;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.UUID;
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
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
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
        String verificationToken = UUID.randomUUID().toString();
        savedUser.setVerificationToken(verificationToken);
        savedUser.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        savedUser = userRepository.save(savedUser);
        try {
            emailService.sendVerificationEmail(
                    savedUser.getCollegeEmail(),
                    savedUser.getFullName(),
                    verificationToken);
        } catch (Exception e) {
            // Log but don't fail registration — user can resend later
            System.err.println("Failed to send verification email: " + e.getMessage());
        }

        String token = jwtTokenProvider.generateToken(savedUser.getCollegeEmail());

        return new AuthResponse(
                token,
                savedUser.getFullName(),
                savedUser.getCollegeEmail(),
                savedUser.getId());
    }

    @Transactional
    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        if (user.getVerificationTokenExpiry() == null
                || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification token has expired");
        }

        user.setVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        User user = userRepository.findByCollegeEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalArgumentException("Email is already verified");
        }

        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        emailService.sendVerificationEmail(
                user.getCollegeEmail(),
                user.getFullName(),
                verificationToken);
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
