package com.example.ces.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ces.model.User;
import com.example.ces.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieve a user by id.
     *
     * @param id user id
     * @return Optional<User> present if found
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }
}