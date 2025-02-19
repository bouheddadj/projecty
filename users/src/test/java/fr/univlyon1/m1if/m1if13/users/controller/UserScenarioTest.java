package fr.univlyon1.m1if.m1if13.users.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

/*
 * TEST DE SCENARIO UTILISATEUR
 */
/**
 * Integration test for user scenarios including login and logout.
 * This test uses Spring Boot's testing support with a random port and MockMvc
 * for HTTP request simulation.
 */
@SpringBootTest()
@AutoConfigureMockMvc
public class UserScenarioTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testScenarioController() throws Exception {

        /*
         * We first create a user with the POST method.
         *
         * We expect a 201 status code.
         * The user is created with the following JSON:
         * login = "Arsene"
         * password = "montenlair"
         * species = "VOLEUR"
         */
        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"Arsene\",\"password\":\"montenlair\",\"species\":\"VOLEUR\"}"))
                .andExpect(status().isCreated());

        String token = mockMvc.perform(post("/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"login\":\"Arsene\",\"password\":\"montenlair\"}")
                .header("Origin", "http://localhost"))
                .andExpect(status().isNoContent())
                .andReturn().getResponse().getHeader("Authorization");

        mockMvc.perform(get("/users/Arsene")
                .header("Authorization",
                        token)
                .header("Origin", "http://localhost"))
                .andExpect(status().isOk());
    }
}
