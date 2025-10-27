package com.example.ces.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base.url:http://localhost:8080}")
    private String baseUrl;

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
        String resetUrl = baseUrl + "/reset-password?token=" + resetToken;

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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = templateEngine.process(templatePath, context);
            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("Email sent successfully to: " + toEmail);
        } catch (MessagingException e) {
            System.err.println("Failed to send email to: " + toEmail);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
