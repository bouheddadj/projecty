package fr.univlyon1.m1if.m1if13.users.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

        // Tests unitaires
        @Autowired
        private UserResourceController userResourceController;

        @Autowired
        private UsersOperationsController usersOperationsController;

        @Test
        void contextLoad() {
                assertThat(userResourceController).isNotNull();
                assertThat(usersOperationsController).isNotNull();
        }

        // Tests d'intégration
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

                // La requête POST doit renvoyer un code 201
                mockMvc.perform(post("/users")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"login\":\"Arsene\",\"password\":\"montenlair\",\"species\":\"VOLEUR\"}"))
                                .andExpect(status().isCreated());

                // La requête POST doit renvoyer un code 204
                String token = mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"login\":\"Arsene\",\"password\":\"montenlair\"}")
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isNoContent())
                                .andReturn().getResponse().getHeader("Authorization");
                // On enlève le "Bearer " du token pour l'utiliser dans les requêtes suivantes
                String tokenAuthenticate = token.replace("Bearer ", "");

                // La requête GET doit renvoyer un code 204
                mockMvc.perform(get("/authenticate")
                                .param("jwt", tokenAuthenticate)
                                .param("origin", "http://localhost"))
                                .andExpect(status().isNoContent());

                // La requête GET doit renvoyer un code 200
                mockMvc.perform(get("/users/Arsene")
                                .header("Authorization",
                                                token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isOk());

                // La requête PUT doit renvoyer un code 204 (On modifie le mot de passe)
                mockMvc.perform(put("/users/Arsene")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"login\":\"Arsene\",\"password\":\"montenlair2\"}"))
                                .andExpect(status().isNoContent());
                // La requête POST doit renvoyer un code 401 (Connexion avec l'ancien mot de
                // passe)
                mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"login\":\"Arsene\",\"password\":\"montenlair\"}")
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isUnauthorized());

                // La requête GET doit renvoyer un code 401 (On vérifie que l'ancien token)
                mockMvc.perform(get("/authenticate")
                                .param("jwt", tokenAuthenticate)
                                .param("origin", "http://localhost"))
                                .andExpect(status().isUnauthorized());

                // La requête POST doit renvoyer un code 204 (Connexion avec le nouveau mdp)
                token = mockMvc.perform(post("/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"login\":\"Arsene\",\"password\":\"montenlair2\"}")
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isNoContent())
                                .andReturn().getResponse().getHeader("Authorization");

                // La requête GET doit renvoyer un code 204 (On recupère les informations du
                // user)
                mockMvc.perform(get("/users/Arsene")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isOk());

                // La requête POST doit renvoyer un code 204 (On se déconnecte)
                mockMvc.perform(post("/logout")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isNoContent());

                // La requête GET doit renvoyer un code 401 (On essaie de récupérer les infos
                // du user)
                mockMvc.perform(get("/users/Arsene")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isUnauthorized());

                // La requête DELETE doit renvoyer un code 204
                mockMvc.perform(delete("/users/Arsene")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isNoContent());

                // La requête GET doit renvoyer un code 401 (On essaie de récupérer les infos
                // du user)
                mockMvc.perform(get("/users/Arsene")
                                .header("Authorization", token)
                                .header("Origin", "http://localhost"))
                                .andExpect(status().isUnauthorized());
        }
}
