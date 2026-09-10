package com.college.ridesharing.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class BookingRequestDTO {

    @NotNull(message = "Seats booked cannot be null")
    @Min(value = 1, message = "Must book at least 1 seat")
    private Integer seatsBooked;

    public BookingRequestDTO() {
    }

    public Integer getSeatsBooked() {
        return seatsBooked;
    }

    public void setSeatsBooked(Integer seatsBooked) {
        this.seatsBooked = seatsBooked;
    }
}
