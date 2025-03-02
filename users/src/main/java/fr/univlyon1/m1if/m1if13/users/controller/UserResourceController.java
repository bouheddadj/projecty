package fr.univlyon1.m1if.m1if13.users.controller;

import fr.univlyon1.m1if.m1if13.users.dto.UserResponseDto;
import fr.univlyon1.m1if.m1if13.users.dto.UsersResponseDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.service.UserResourceService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.server.ResponseStatusException;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;
import java.net.URI;
import java.util.NoSuchElementException;

/**
 * Aiguillage des requêtes liées aux ressources des utilisateurs.
 */
@RestController
@RequestMapping("/users")
public class UserResourceController {

    @Autowired
    private UserResourceService userResourceService;

    @GetMapping(produces = { "application/json", "application/xml" })
    public ResponseEntity<UsersResponseDto> getAllUsers() {
        try {
            return ResponseEntity.ok(userResourceService.getAllUsersDto());
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Un problème est survenu lors de la récupération des utilisateurs.");
        }
    }

    @PostMapping(consumes = { "application/json", "application/xml" })
    public ResponseEntity<Void> createUser(@RequestBody User user)
            throws NameNotFoundException, NameAlreadyBoundException {
        try {
            return ResponseEntity.created(userResourceService.createUser(user)).build();
        } catch (NameNotFoundException e) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }

    @GetMapping(value = "/{userId}", produces = { "application/json", "application/xml" })
    public ResponseEntity<UserResponseDto> getUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(userResourceService.getUser(userId));
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Utilisateur non trouvé.");
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Un problème est survenu lors de la récupération de l'utilisateur.");
        }
    }

    @PutMapping(value = "/{userId}", consumes = { "application/json", "application/xml" })
    public ResponseEntity<Void> updateUser(
            @PathVariable String userId, @RequestBody User user, @RequestHeader("Origin") String origin,
            HttpServletResponse response) throws NameNotFoundException {
        try {
            userResourceService.createUser(user);
            return ResponseEntity.created(URI.create("users/" + userId)).build();
        } catch (NameAlreadyBoundException e) {
            userResourceService.updateUser(userId, user, origin, response);
            return ResponseEntity.noContent().build();
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        try {
            userResourceService.deleteUser(userId);
            return ResponseEntity.noContent().build();
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Utilisateur non trouvé.");
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Un problème est survenu lors de la suppression de l'utilisateur.");
        }
    }
}
