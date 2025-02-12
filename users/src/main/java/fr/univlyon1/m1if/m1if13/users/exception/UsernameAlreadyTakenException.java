package fr.univlyon1.m1if.m1if13.users.exception;

/**
 * Exception levée lorsqu'un utilisateur tente de s'inscrire avec un nom
 * d'utilisateur déjà pris.
 */
public class UsernameAlreadyTakenException extends RuntimeException {
    public UsernameAlreadyTakenException(String message) {
        super(message);
    }
}
