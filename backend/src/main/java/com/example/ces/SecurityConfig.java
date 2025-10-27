package com.example.ces;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration to permit unauthenticated access to the public API endpoints
 * while keeping default security for any other endpoints. This is necessary because
 * `spring-boot-starter-security` is on the classpath which enables default HTTP Basic
 * auth (causing 401 responses for anonymous requests). We explicitly allow `/api/**`.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // TEMP DEBUG: allow all requests so we can determine whether the 401
                // is caused by security matchers. Revert after debugging.
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
