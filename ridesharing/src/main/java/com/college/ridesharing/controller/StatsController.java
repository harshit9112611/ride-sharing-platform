package com.college.ridesharing.controller;

import com.college.ridesharing.dto.StatsResponseDTO;
import com.college.ridesharing.repository.BookingRepository;
import com.college.ridesharing.repository.RideRepository;
import com.college.ridesharing.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;

    public StatsController(UserRepository userRepository, RideRepository rideRepository, BookingRepository bookingRepository) {
        this.userRepository = userRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<StatsResponseDTO> getStats() {
        long totalUsers = userRepository.count();
        long totalRides = rideRepository.count();
        long totalBookings = bookingRepository.count();
        Long seatsShared = bookingRepository.sumConfirmedSeats();

        StatsResponseDTO response = new StatsResponseDTO(
                totalUsers,
                totalRides,
                totalBookings,
                seatsShared != null ? seatsShared : 0L
        );
        return ResponseEntity.ok(response);
    }
}
