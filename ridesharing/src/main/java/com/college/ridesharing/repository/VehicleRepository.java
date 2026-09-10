package com.college.ridesharing.repository;

import com.college.ridesharing.model.Vehicle;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByOwnerId(Long ownerId);
    List<Vehicle> findByOwner_CollegeEmail(String collegeEmail);
    boolean existsByVehicleNumber(String vehicleNumber);
    boolean existsByVehicleNumberAndIdNot(String vehicleNumber, Long id);
}
