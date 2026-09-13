package com.college.ridesharing.controller;

import com.college.ridesharing.dto.BookingRequestDTO;
import com.college.ridesharing.dto.BookingResponseDTO;
import com.college.ridesharing.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.college.ridesharing.model.Booking;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/rides/{rideId}/book")
    public ResponseEntity<?> bookRide(
            @PathVariable Long rideId,
            @Valid @RequestBody BookingRequestDTO request,
            Authentication authentication) {
        try {
            String passengerEmail = authentication.getName();
            BookingResponseDTO response = bookingService.bookRide(rideId, passengerEmail, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            String passengerEmail = authentication.getName();
            BookingResponseDTO response = bookingService.cancelBooking(bookingId, passengerEmail);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/bookings/my")
    public ResponseEntity<List<BookingResponseDTO>> getMyBookings(Authentication authentication) {
        String passengerEmail = authentication.getName();
        List<BookingResponseDTO> bookings = bookingService.getMyBookings(passengerEmail);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/bookings/received")
    public ResponseEntity<List<BookingResponseDTO>> getReceivedRequests(
            @RequestParam(defaultValue = "CONFIRMED") String status,
            Authentication authentication) {
        User driver = userRepository.findByCollegeEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        Booking.BookingStatus bookingStatus;
        try {
            bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status. Use PENDING, CONFIRMED, or CANCELLED");
        }
        return ResponseEntity.ok(bookingService.getReceivedRequests(driver.getId(), bookingStatus));
    }
}
