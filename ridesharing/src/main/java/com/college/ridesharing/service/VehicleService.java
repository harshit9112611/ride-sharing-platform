package com.college.ridesharing.service;

import com.college.ridesharing.dto.VehicleDTO;
import com.college.ridesharing.model.User;
import com.college.ridesharing.model.Vehicle;
import com.college.ridesharing.repository.UserRepository;
import com.college.ridesharing.repository.VehicleRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public VehicleDTO addVehicle(VehicleDTO dto, String ownerEmail) {
        User owner = userRepository.findByCollegeEmail(ownerEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (vehicleRepository.existsByVehicleNumber(dto.getVehicleNumber())) {
            throw new IllegalArgumentException("Vehicle number already registered");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setOwner(owner);
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setColor(dto.getColor());
        vehicle.setVehicleNumber(dto.getVehicleNumber());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDTO(saved);
    }

    public List<VehicleDTO> getMyVehicles(String ownerEmail) {
        return vehicleRepository.findByOwner_CollegeEmail(ownerEmail).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDTO updateVehicle(Long id, VehicleDTO dto, String ownerEmail) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        if (!vehicle.getOwner().getCollegeEmail().equals(ownerEmail)) {
            throw new IllegalArgumentException("You are not authorized to update this vehicle");
        }

        if (vehicleRepository.existsByVehicleNumberAndIdNot(dto.getVehicleNumber(), id)) {
            throw new IllegalArgumentException("Vehicle number already in use by another vehicle");
        }

        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setBrand(dto.getBrand());
        vehicle.setModel(dto.getModel());
        vehicle.setColor(dto.getColor());
        vehicle.setVehicleNumber(dto.getVehicleNumber());

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToDTO(saved);
    }

    @Transactional
    public void deleteVehicle(Long id, String ownerEmail) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));

        if (!vehicle.getOwner().getCollegeEmail().equals(ownerEmail)) {
            throw new IllegalArgumentException("You are not authorized to delete this vehicle");
        }

        vehicleRepository.delete(vehicle);
    }

    private VehicleDTO mapToDTO(Vehicle vehicle) {
        return new VehicleDTO(
                vehicle.getId(),
                vehicle.getVehicleType(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.getVehicleNumber()
        );
    }
}
