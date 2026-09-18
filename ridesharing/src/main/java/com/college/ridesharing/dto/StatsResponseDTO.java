package com.college.ridesharing.dto;

public class StatsResponseDTO {

    private Long totalUsers;
    private Long totalRides;
    private Long totalBookings;
    private Long seatsShared;

    public StatsResponseDTO() {
    }

    public StatsResponseDTO(Long totalUsers, Long totalRides, Long totalBookings, Long seatsShared) {
        this.totalUsers = totalUsers;
        this.totalRides = totalRides;
        this.totalBookings = totalBookings;
        this.seatsShared = seatsShared;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalRides() {
        return totalRides;
    }

    public void setTotalRides(Long totalRides) {
        this.totalRides = totalRides;
    }

    public Long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(Long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public Long getSeatsShared() {
        return seatsShared;
    }

    public void setSeatsShared(Long seatsShared) {
        this.seatsShared = seatsShared;
    }
}
