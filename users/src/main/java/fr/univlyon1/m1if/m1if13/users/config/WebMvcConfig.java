package fr.univlyon1.m1if.m1if13.users.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Classe de configuration principale.
 */
@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {

        @Override
        public void addCorsMappings(CorsRegistry registry) {

                String[] origins = {
                                "http://localhost",
                                "http://127.0.0.1:5500", // temporaire pour les tests en local
                                "http://192.168.75.33:8443",
                                "https://192.168.75.33:8443",
                };

                registry
                                .addMapping("/users/{login}")
                                .allowedOrigins(origins)
                                .allowCredentials(true)
                                .maxAge(3600)
                                .allowedMethods("GET")
                                .allowedHeaders("Authorization", "Content-Type")
                                .exposedHeaders("Authorization",
                                                "Content-Type", "Location", "Link");
                registry
                                .addMapping("/login")
                                .allowedOrigins(origins)
                                .allowedMethods("POST")
                                .allowedHeaders("Authorization", "Content-Type")
                                .exposedHeaders("Authorization",
                                                "Content-Type", "Location", "Link")
                                .maxAge(3600);
                registry
                                .addMapping("/logout")
                                .allowedOrigins(origins)
                                .allowedMethods("POST")
                                .allowedHeaders("Authorization", "Content-Type")
                                .exposedHeaders("Authorization",
                                                "Content-Type", "Location", "Link")
                                .maxAge(3600);
        }
}
