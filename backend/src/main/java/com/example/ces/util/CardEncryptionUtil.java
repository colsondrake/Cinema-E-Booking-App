package com.example.ces.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class CardEncryptionUtil {

    @Value("${app.encryption.key:ThisIsASecretKey123456789012345}")
    private String encryptionKey;

    private static final String ALGORITHM = "AES";

    /**
     * Encrypt card number
     */
    public String encrypt(String cardNumber) {
        if (cardNumber == null || cardNumber.isEmpty()) {
            return null;
        }
        
        try {
            // Ensure key is 16 bytes for AES-128
            String key = padKey(encryptionKey);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encryptedBytes = cipher.doFinal(cardNumber.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error encrypting card number", e);
        }
    }

    /**
     * Decrypt card number
     */
    public String decrypt(String encryptedCardNumber) {
        if (encryptedCardNumber == null || encryptedCardNumber.isEmpty()) {
            return null;
        }
        
        try {
            String key = padKey(encryptionKey);
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), ALGORITHM);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey);
            
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedCardNumber);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("Error decrypting card number", e);
        }
    }

    /**
     * Pad or trim key to 16 bytes
     */
    private String padKey(String key) {
        if (key.length() < 16) {
            // Pad with zeros
            return String.format("%-16s", key).replace(' ', '0');
        } else if (key.length() > 16) {
            // Trim to 16 characters
            return key.substring(0, 16);
        }
        return key;
    }

    /**
     * Mask card number for display (show only last 4 digits)
     */
    public static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return "****";
        }
        
        String lastFour = cardNumber.substring(cardNumber.length() - 4);
        return "**** **** **** " + lastFour;
    }
}