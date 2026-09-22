package com.college.ridesharing.service;

import com.college.ridesharing.dto.BookingRequestDTO;
import com.college.ridesharing.dto.BookingResponseDTO;
import com.college.ridesharing.model.Booking;
import com.college.ridesharing.model.Booking.BookingStatus;
import com.college.ridesharing.model.Ride;
import com.college.ridesharing.model.Ride.RideStatus;
import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.BookingRepository;
import com.college.ridesharing.repository.RideRepository;
import com.college.ridesharing.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Push notification service
    private final PushService pushService;

    public BookingService(
            BookingRepository bookingRepository,
            RideRepository rideRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate,
            PushService pushService) {

        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.pushService = pushService;
    }

    @Transactional
    public BookingResponseDTO bookRide(Long rideId, User passenger, BookingRequestDTO request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new IllegalArgumentException("Ride not found"));

        if (ride.getDriver().getId().equals(passenger.getId())) {
            throw new IllegalArgumentException("You cannot book your own ride");
        }

        if (ride.getStatus() != Ride.RideStatus.OPEN) {
            throw new IllegalArgumentException("Ride is not open for booking");
        }

        if (ride.getAvailableSeats() < request.getSeatsBooked()) {
            throw new IllegalArgumentException("Not enough seats available");
        }

        boolean alreadyConfirmed = bookingRepository.existsByRideIdAndPassengerIdAndStatus(
                rideId, passenger.getId(), Booking.BookingStatus.CONFIRMED);
        boolean alreadyPending = bookingRepository.existsByRideIdAndPassengerIdAndStatus(
                rideId, passenger.getId(), Booking.BookingStatus.PENDING);

        if (alreadyConfirmed || alreadyPending) {
            throw new IllegalArgumentException("You have already booked this ride");
        }

        Booking booking = new Booking();
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setSeatsBooked(request.getSeatsBooked());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        Booking savedBooking = bookingRepository.save(booking);

        try {
            messagingTemplate.convertAndSend(
                    "/topic/driver/" + ride.getDriver().getId() + "/bookings",
                    mapToDTO(savedBooking));
        } catch (Exception e) {
            System.err.println("WebSocket to driver failed: " + e.getMessage());
        }

        try {
            pushService.notifyNewBooking(
                    ride.getDriver().getId(),
                    passenger.getFullName(),
                    ride.getSourceLocation(),
                    ride.getDestinationLocation());
        } catch (Exception e) {
            System.err.println("Push to driver failed: " + e.getMessage());
        }

        return mapToDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO acceptBooking(Long bookingId, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        Ride ride = booking.getRide();
        User driver = ride.getDriver();

        if (!driver.getCollegeEmail().equals(driverEmail)) {
            throw new IllegalArgumentException("Only the driver can accept this booking");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be accepted");
        }

        if (booking.getSeatsBooked() > ride.getAvailableSeats()) {
            throw new IllegalArgumentException("Not enough seats available");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking savedBooking = bookingRepository.save(booking);

        ride.setAvailableSeats(ride.getAvailableSeats() - booking.getSeatsBooked());
        if (ride.getAvailableSeats() == 0) {
            ride.setStatus(Ride.RideStatus.FULL);
        }
        rideRepository.save(ride);

        try {
            pushService.notifyBookingAccepted(
                    booking.getPassenger().getId(),
                    driver.getFullName(),
                    ride.getSourceLocation(),
                    ride.getDestinationLocation());
        } catch (Exception e) {
            System.err.println("Push to passenger failed: " + e.getMessage());
        }

        return mapToDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO rejectBooking(Long bookingId, String driverEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (!booking.getRide().getDriver().getCollegeEmail().equals(driverEmail)) {
            throw new IllegalArgumentException("Only the driver can reject this booking");
        }

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        return mapToDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(
            Long bookingId,
            String passengerEmail) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Booking not found"));

        if (!booking.getPassenger().getCollegeEmail()
                .equals(passengerEmail)) {

            throw new IllegalArgumentException(
                    "You can only cancel your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalArgumentException(
                    "Only confirmed bookings can be cancelled");
        }

        Ride ride = booking.getRide();

        // Restore seats
        ride.setAvailableSeats(
                ride.getAvailableSeats() + booking.getSeatsBooked());

        if (ride.getStatus() == RideStatus.FULL
                && ride.getAvailableSeats() > 0) {

            ride.setStatus(RideStatus.OPEN);
        }

        rideRepository.save(ride);

        booking.setStatus(BookingStatus.CANCELLED);

        Booking updatedBooking =
                bookingRepository.save(booking);

        return mapToDTO(updatedBooking);
    }

    public List<BookingResponseDTO> getMyBookings(
            String passengerEmail) {

        User passenger = userRepository
                .findByCollegeEmail(passengerEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Passenger not found"));

        List<Booking> bookings =
                bookingRepository
                        .findByPassengerIdOrderByCreatedAtDesc(
                                passenger.getId());

        return bookings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getReceivedRequests(
            Long driverId,
            Booking.BookingStatus status) {

        List<Booking> bookings =
                bookingRepository
                        .findByRide_Driver_IdAndStatus(
                                driverId,
                                status);

        return bookings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BookingResponseDTO mapToDTO(Booking booking) {

        BookingResponseDTO dto = new BookingResponseDTO();

        dto.setId(booking.getId());
        dto.setRideId(booking.getRide().getId());

        if (booking.getPassenger() != null) {
            dto.setPassengerId(
                    booking.getPassenger().getId());

            dto.setPassengerName(
                    booking.getPassenger().getFullName());
        }

        dto.setSeatsBooked(booking.getSeatsBooked());
        dto.setStatus(booking.getStatus().name());
        dto.setCreatedAt(booking.getCreatedAt());

        dto.setSourceLocation(
                booking.getRide().getSourceLocation());

        dto.setDestinationLocation(
                booking.getRide().getDestinationLocation());

        dto.setDepartureDate(
                booking.getRide()
                        .getDepartureDate()
                        .toString());

        dto.setDepartureTime(
                booking.getRide()
                        .getDepartureTime()
                        .toString());

        if (booking.getPassenger() != null) {
            dto.setPassengerBranch(booking.getPassenger().getBranch());
            dto.setPassengerAcademicYear(booking.getPassenger().getAcademicYear());
        }

        return dto;
    }
}
