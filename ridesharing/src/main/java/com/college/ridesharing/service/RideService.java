package com.college.ridesharing.service;

import com.college.ridesharing.dto.RideRequestDTO;
import com.college.ridesharing.model.Ride;
import com.college.ridesharing.model.Ride.RideStatus;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.RideRepository;
import com.college.ridesharing.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public RideService(
            RideRepository rideRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Ride createRide(RideRequestDTO request, String driverEmail) {
        User driver = userRepository.findByCollegeEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        Ride ride = new Ride();
        ride.setDriver(driver);
        ride.setSourceLocation(request.getSourceLocation());
        ride.setDestinationLocation(request.getDestinationLocation());
        ride.setDepartureDate(request.getDepartureDate());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setRideType(request.getRideType());
        ride.setPrice(request.getRideType() == Ride.RideType.FREE ? 0.0 : request.getPrice());
        ride.setStatus(RideStatus.OPEN);
        ride.setCreatedAt(LocalDateTime.now());

        Ride savedRide = rideRepository.save(ride);
        messagingTemplate.convertAndSend("/topic/rides/new", savedRide);
        return savedRide;
    }

    public List<Ride> searchRides(String source, String destination, LocalDate date) {
        return rideRepository.findAvailableRides(source, destination, date);
    }

    public List<Ride> getMyRides(String driverEmail) {
        return rideRepository.findByDriver_CollegeEmailOrderByCreatedAtDesc(driverEmail);
    }

    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));
    }
}
