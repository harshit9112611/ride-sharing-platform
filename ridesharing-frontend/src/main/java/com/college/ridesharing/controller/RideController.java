package com.college.ridesharing.controller;

import com.college.ridesharing.dto.RideRequestDTO;
import com.college.ridesharing.model.Ride;
import com.college.ridesharing.service.RideService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    public ResponseEntity<?> createRide(
            @Valid @RequestBody RideRequestDTO request,
            Authentication authentication) {
        try {
            String driverEmail = authentication.getName();
            Ride ride = rideService.createRide(request, driverEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(ride);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Ride>> searchRides(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Ride> rides = rideService.searchRides(source, destination, date);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Ride>> getMyRides(Authentication authentication) {
        List<Ride> rides = rideService.getMyRides(authentication.getName());
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRideById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(rideService.getRideById(id));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
