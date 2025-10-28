package com.example.ces.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Value("${spring.mail.username:no-reply@localhost}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

    // Frontend base URL for pages (e.g., reset password UI)
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendBaseUrl;

    /** Registration Confirmation Email */
    public void sendRegistrationConfirmationEmail(String toEmail, String userName, String confirmationToken) {
        String subject = "Welcome to CES Cinema - Please Verify Your Email";
        String confirmationUrl = baseUrl + "/api/auth/verify-email?token=" + confirmationToken;

        Context context = new Context();
        context.setVariables(Map.of("userName", userName, "confirmationUrl", confirmationUrl));
        sendHtmlEmail(toEmail, subject, "email-templates/registration-confirmation", context);
    }

    /** Password Reset Email */
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        String subject = "CES Cinema - Password Reset Request";
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;

        Context context = new Context();
        context.setVariables(Map.of("userName", userName, "resetUrl", resetUrl));
        sendHtmlEmail(toEmail, subject, "email-templates/password-reset", context);
    }

    /** Profile Change Notification */
    public void sendProfileChangeNotification(String toEmail, String userName, String changeType) {
        String subject = "CES Cinema - Your Profile Has Been Updated";

        Context context = new Context();
        context.setVariables(Map.of(
                "userName", userName,
                "changeType", changeType,
                "changeTime", new java.util.Date()
        ));
        sendHtmlEmail(toEmail, subject, "email-templates/profile-changed", context);
    }

    /** Core reusable HTML email sender */
    private void sendHtmlEmail(String toEmail, String subject, String templatePath, Context context) {
        try {
            // Check if mail sender is properly configured
            if (mailSender == null) {
                System.err.println("Warning: Mail sender not configured. Skipping email to: " + toEmail);
                return;
            }

            // Check if mail credentials are configured
            if (fromEmail == null || fromEmail.trim().isEmpty() || fromEmail.equals("no-reply@localhost") || 
                mailPassword == null || mailPassword.trim().isEmpty()) {
                System.err.println("Warning: SMTP credentials not configured. Skipping email to: " + toEmail);
                System.err.println("To enable email verification, set SMTP_USERNAME and SMTP_PASSWORD environment variables.");
                return;
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Fallback for missing/blank from address to avoid AddressException
            String safeFrom = (fromEmail != null && !fromEmail.trim().isEmpty() && !fromEmail.equals("no-reply@localhost")) 
                ? fromEmail.trim() : "no-reply@localhost";
            helper.setFrom(safeFrom);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = templateEngine.process(templatePath, context);
            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("Email sent successfully to: " + toEmail);
        } catch (MailAuthenticationException e) {
            System.err.println("Failed to authenticate with email server. Please check SMTP credentials in environment variables (SMTP_USERNAME and SMTP_PASSWORD).");
            System.err.println("Email not sent to: " + toEmail + ". In development, registration will proceed without email verification.");
            // Don't throw exception to allow registration to proceed
        } catch (MessagingException e) {
            System.err.println("Failed to send email to: " + toEmail + ". Reason: " + e.getMessage());
            System.err.println("Email not sent to: " + toEmail + ". In development, registration will proceed without email verification.");
            // Don't throw exception to allow registration to proceed
        } catch (Exception e) {
            System.err.println("Unexpected error sending email to: " + toEmail + ". Reason: " + e.getMessage());
            System.err.println("Email not sent to: " + toEmail + ". In development, registration will proceed without email verification.");
            // Don't throw exception to allow registration to proceed
        }
    }
}