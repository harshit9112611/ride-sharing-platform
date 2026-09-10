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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
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
}
