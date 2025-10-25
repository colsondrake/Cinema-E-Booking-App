package com.example.ces.controller;

import com.example.ces.dto.UserProfileDTO;
import com.example.ces.model.Address;
import com.example.ces.model.PaymentCard;
import com.example.ces.model.WebUser;
import com.example.ces.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    // ✅ Test GET user by ID
    @Test
    public void testGetUserById() throws Exception {
        WebUser user = new WebUser(
                UUID.randomUUID().toString(),
                "Tasnuva",
                "Tabassum",
                "tas@example.com",
                "password123",
                "1234567890",
                true,
                true,
                true,
                new Address("123 Main St", "Rajshahi", "Rajshahi", "6000", "Bangladesh"),
                Collections.emptyList(),
                true
        );

        when(userService.getUserById(anyString())).thenReturn(java.util.Optional.of(user));

        mockMvc.perform(get("/api/users/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Tasnuva"))
                .andExpect(jsonPath("$.email").value("tas@example.com"));
    }

    // ✅ Test PUT update profile
    @Test
    public void testUpdateUserProfile() throws Exception {
        String userId = UUID.randomUUID().toString();

        // Mock DTO request body
        UserProfileDTO profileDTO = new UserProfileDTO();
        profileDTO.setFirstName("Tasnuva");
        profileDTO.setLastName("Updated");
        profileDTO.setPhone("9999999999");
        profileDTO.setHomeAddress(new Address("New Road", "Dhaka", "Dhaka", "1200", "Bangladesh"));
        profileDTO.setSubscribeToPromotions(true);

        // Mock returned user object
        WebUser updatedUser = new WebUser();
        updatedUser.setId(userId);
        updatedUser.setFirstName("Tasnuva");
        updatedUser.setLastName("Updated");
        updatedUser.setPhone("9999999999");
        updatedUser.setEmail("tas@example.com");

        // Mock service layer
        when(userService.updateUserProfile(anyString(), any(UserProfileDTO.class), any()))
                .thenReturn(updatedUser);

        mockMvc.perform(put("/api/users/" + userId + "/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Profile updated successfully"))
                .andExpect(jsonPath("$.user.firstName").value("Tasnuva"))
                .andExpect(jsonPath("$.user.lastName").value("Updated"))
                .andExpect(jsonPath("$.user.email").value("tas@example.com"));
    }

    // ✅ Test POST add payment card
    @Test
        public void testAddPaymentCard() throws Exception {
        String userId = UUID.randomUUID().toString();

        // Create test card
        PaymentCard newCard = new PaymentCard();
        newCard.setCardType("VISA");
        newCard.setCardholderName("Tasnuva Tabassum");
        newCard.setExpiryDate("12/28");
        newCard.setLastFourDigits("1111");

        // Mock a valid saved card returned by service
        PaymentCard savedCard = new PaymentCard();
        savedCard.setId("card123");
        savedCard.setCardType("VISA");
        savedCard.setCardholderName("Tasnuva Tabassum");
        savedCard.setExpiryDate("12/28");
        savedCard.setLastFourDigits("1111");

        // Mock behavior of service
        when(userService.addPaymentCard(eq(userId), any(PaymentCard.class))).thenReturn(savedCard);

        mockMvc.perform(post("/api/users/" + userId + "/payment-cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCard)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Payment card added successfully"))
                .andExpect(jsonPath("$.card.cardType").value("VISA"))
                .andExpect(jsonPath("$.card.expiryDate").value("12/28"))
                .andExpect(jsonPath("$.card.cardholderName").value("Tasnuva Tabassum"))
                .andExpect(jsonPath("$.card.lastFourDigits").value("1111"));
        }


}
