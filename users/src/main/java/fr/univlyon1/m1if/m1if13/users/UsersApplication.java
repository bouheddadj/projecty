package fr.univlyon1.m1if.m1if13.users;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

/**
 **
 * @OpenAPIDefinition:
 * - info: Fournit des métadonnées pour l'API, y compris le titre, la version et la description.
 *
 * Méthode principale:
 * - SpringApplication.run(UsersApplication.class, args): Lance l'application Spring Boot.
 */
@OpenAPIDefinition(
	info = @Info(
		title = "API Utilisateurs",
		version = "1.0.0",
		description = "API de gestion des utilisateurs (connexion, déconnexion, récupération des infos)"
	)
)
@SpringBootApplication
public class UsersApplication {

	public static void main(String[] args) {
		SpringApplication.run(UsersApplication.class, args);
	}
}
