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

        String[] staticOrigins = {
                "https://192.168.75.33",
                "http://192.168.75.33:8443",
                "https://192.168.75.33:8443"
        };

        String[] wildcardOrigins = {
                "http://localhost:*",
                "http://127.0.0.1:*"
        };

        registry.addMapping("/**")
                .allowedOriginPatterns(merge(staticOrigins, wildcardOrigins))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Authorization", "Content-Type", "Location", "Link")
                .allowCredentials(true)
                .maxAge(3600);
    }

    private String[] merge(String[]... arrays) {
        return java.util.Arrays.stream(arrays)
                .flatMap(java.util.Arrays::stream)
                .toArray(String[]::new);
    }
}
