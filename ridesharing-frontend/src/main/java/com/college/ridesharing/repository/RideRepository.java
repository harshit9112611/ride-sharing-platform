package com.college.ridesharing.repository;

import com.college.ridesharing.model.Ride;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {

    @Query("SELECT r FROM Ride r WHERE r.sourceLocation = :source " +
           "AND r.destinationLocation = :destination " +
           "AND r.departureDate = :date " +
           "AND r.status = 'OPEN' " +
           "AND r.availableSeats > 0")
    List<Ride> findAvailableRides(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("date") LocalDate date);

    List<Ride> findByDriver_CollegeEmailOrderByCreatedAtDesc(String collegeEmail);
}
