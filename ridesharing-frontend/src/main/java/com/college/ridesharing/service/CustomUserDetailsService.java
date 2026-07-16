package com.college.ridesharing.service;

import com.college.ridesharing.model.User;
import com.college.ridesharing.repository.UserRepository;
import java.util.Collections;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String collegeEmail) throws UsernameNotFoundException {
        User user = userRepository.findByCollegeEmail(collegeEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + collegeEmail));

        return new org.springframework.security.core.userdetails.User(
                user.getCollegeEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }
}
