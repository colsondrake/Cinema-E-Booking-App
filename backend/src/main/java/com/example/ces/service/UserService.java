package com.example.ces.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ces.model.User;
import com.example.ces.model.VerificationToken;
import com.example.ces.model.ResetToken;
import com.example.ces.repository.UserRepository;
import com.example.ces.repository.VerificationTokenRepository;
import com.example.ces.repository.ResetTokenRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final ResetTokenRepository resetTokenRepository;
    private final EmailService emailService; // Added EmailService
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
            VerificationTokenRepository verificationTokenRepository,
            ResetTokenRepository resetTokenRepository,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Use BCrypt
    }

    // ----------------- User CRUD -----------------
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User updateUser(User user) {
        User updatedUser = userRepository.save(user);
        // Send profile change notification email
        emailService.sendProfileChangeNotification(user.getEmail());
        return updatedUser;
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    // ----------------- Registration -----------------
    public String registerUser(User user) {
        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setVerified(false); // must verify email
        userRepository.save(user);

        // Generate verification token
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(token, user);
        verificationTokenRepository.save(verificationToken);

        // Store token on user (optional)
        user.setVerificationToken(token);
        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), token);

        return token; // also return for testing if needed
    }

    public boolean verifyUser(String token) {
        Optional<VerificationToken> optional = verificationTokenRepository.findByToken(token);
        if (optional.isEmpty())
            return false;

        VerificationToken verificationToken = optional.get();
        User user = verificationToken.getUser();
        user.setVerified(true);
        user.setVerificationToken(null); // clear token after verification
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
        return true;
    }

    // ----------------- Login -----------------
    public User login(String email, String password) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty())
            throw new RuntimeException("Invalid email or password");

        User user = optionalUser.get();

        if (!user.getVerified()) {
            throw new RuntimeException("Email not verified");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    // ----------------- Forgot Password -----------------
    public String initiatePasswordReset(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty())
            throw new RuntimeException("User not found");

        User user = optionalUser.get();
        String token = UUID.randomUUID().toString();
        ResetToken resetToken = new ResetToken(token, user);
        resetTokenRepository.save(resetToken);

        // Store token on user (optional)
        user.setResetToken(token);
        userRepository.save(user);

        // Send password reset email
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        return token; // also return for testing if needed
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<ResetToken> optional = resetTokenRepository.findByToken(token);
        if (optional.isEmpty())
            return false;

        ResetToken resetToken = optional.get();
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null); // clear token after reset
        userRepository.save(user);

        resetTokenRepository.delete(resetToken);
        return true;
    }
}
