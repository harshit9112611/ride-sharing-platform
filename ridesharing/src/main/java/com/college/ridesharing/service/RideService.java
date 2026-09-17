package com.college.ridesharing.service;

import com.college.ridesharing.dto.RideRequestDTO;
import com.college.ridesharing.model.Ride;
import com.college.ridesharing.model.Ride.RideStatus;
import com.college.ridesharing.model.User;
import com.college.ridesharing.model.Vehicle;
import com.college.ridesharing.model.Booking;
import com.college.ridesharing.repository.RideRepository;
import com.college.ridesharing.repository.UserRepository;
import com.college.ridesharing.repository.VehicleRepository;
import com.college.ridesharing.repository.BookingRepository;
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
    private final VehicleRepository vehicleRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BookingRepository bookingRepository;

    public RideService(
            RideRepository rideRepository,
            UserRepository userRepository,
            VehicleRepository vehicleRepository,
            SimpMessagingTemplate messagingTemplate,
            BookingRepository bookingRepository) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.messagingTemplate = messagingTemplate;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public Ride createRide(RideRequestDTO request, String driverEmail) {
        User driver = userRepository.findByCollegeEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        if (!Boolean.TRUE.equals(driver.getVerified())) {
            throw new IllegalArgumentException("Please verify your email before posting rides");
        }

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

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new IllegalArgumentException("Selected vehicle not found"));
            if (!vehicle.getOwner().getId().equals(driver.getId())) {
                throw new IllegalArgumentException("Vehicle does not belong to driver");
            }
            ride.setVehicle(vehicle);
        }

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

    @Transactional
    public void deleteRide(Long id, String driverEmail) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));

        if (!ride.getDriver().getCollegeEmail().equals(driverEmail)) {
            throw new IllegalArgumentException("Only the driver can delete this ride");
        }
        if (ride.getStatus() != RideStatus.OPEN) {
            throw new IllegalArgumentException("Only OPEN rides can be deleted");
        }

        List<Booking> bookings = bookingRepository.findByRideId(id);
        boolean hasConfirmed = bookings.stream().anyMatch(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED);
        if (hasConfirmed) {
            throw new IllegalArgumentException("Cannot delete ride with confirmed bookings. Cancel them first.");
        }
        bookingRepository.deleteAll(bookings);
        rideRepository.delete(ride);
    }
}
