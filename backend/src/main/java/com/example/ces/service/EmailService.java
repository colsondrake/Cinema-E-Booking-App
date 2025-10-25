package com.example.ces.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send a simple email.
     *
     * @param to      recipient email
     * @param subject email subject
     * @param text    email body
     */
    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);

        mailSender.send(message);
    }

    /**
     * Send verification email for registration.
     *
     * @param to    recipient email
     * @param token verification token
     */
    public void sendVerificationEmail(String to, String token) {
        String subject = "Confirm your registration";
        String verificationLink = "http://localhost:3000/verify?token=" + token; // frontend URL
        String text = "Thank you for registering! Click the link to verify your account:\n" + verificationLink;

        sendEmail(to, subject, text);
    }

    /**
     * Send password reset email.
     *
     * @param to    recipient email
     * @param token reset token
     */
    public void sendPasswordResetEmail(String to, String token) {
        String subject = "Password Reset Request";
        String resetLink = "http://localhost:3000/reset-password?token=" + token; // frontend URL
        String text = "Click the link below to reset your password:\n" + resetLink;

        sendEmail(to, subject, text);
    }

    /**
     * Notify user of profile changes.
     *
     * @param to recipient email
     */
    public void sendProfileChangeNotification(String to) {
        String subject = "Profile Updated";
        String text = "Your profile information has been updated successfully. If this was not you, please contact support.";

        sendEmail(to, subject, text);
    }
}
