package com.college.ridesharing.repository;

import com.college.ridesharing.model.Booking;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRideId(Long rideId);
    
    List<Booking> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);
    
    boolean existsByRideIdAndPassengerIdAndStatus(Long rideId, Long passengerId, Booking.BookingStatus status);
}
