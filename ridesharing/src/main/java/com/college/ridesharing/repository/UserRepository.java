package com.college.ridesharing.repository;

import com.college.ridesharing.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByCollegeEmail(String collegeEmail);

    Optional<User> findByVerificationToken(String verificationToken);

    boolean existsByCollegeEmail(String collegeEmail);

    boolean existsByEnrollmentNumber(String enrollmentNumber);
}
