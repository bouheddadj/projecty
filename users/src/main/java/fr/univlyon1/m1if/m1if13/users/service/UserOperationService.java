package fr.univlyon1.m1if.m1if13.users.service;

import fr.univlyon1.m1if.m1if13.users.dto.LoginRequestDto;
import fr.univlyon1.m1if.m1if13.users.model.User;
import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.util.UserTokenProvider;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import javax.naming.NameNotFoundException;

/**
 * Méthodes de service du contrôleur d'opérations sur les utilisateurs.
 */
@Service
public class UserOperationService {

    @Autowired
    private UserTokenProvider userTokenProvider;
    @Autowired
    private UserDao userDao;

    /**
     * Méthode réalisant le login : valide le contenu de la requête et place les
     * informations sur l'utilisateur dans une Map en attribut de requête.
     *
     * @param dto      L'utilisateur trouvé dans le DAO
     * @param response La réponse (nécessaire pour rajouter le header
     *                 "Authorization" avec le token JWT).
     * @throws NameNotFoundException Si le login de l'utilisateur ne correspond pas
     *                               à un utilisateur existant
     * @throws MatchException        Si la vérification des credentials de
     *                               l'utilisateur a échoué.
     */
    public void login(LoginRequestDto dto, String origin, HttpServletResponse response)
            throws NameNotFoundException, AuthenticationException {
        User user = userDao.findOne(dto.login());
        user.authenticate(dto.password());
        if (!user.isConnected()) {
            throw new AuthenticationException();
        }
        String jwt = userTokenProvider.generateToken(user, origin);
        response.setHeader("Authorization", "Bearer " + jwt);
        response.setHeader("Access-Control-Expose-Headers", "Authorization");
    }

    /**
     * Méthode appelant la déconnexion dans le <code>ConnectionManager</code>.
     *
     * @param username le login de l'utilisateur à déconnecter (supposé positionné
     *                 dans les attributs de la requête)
     */
    public void logout(String username) throws AuthenticationException, NameNotFoundException {
        User user = userDao.findOne(username);
        if (user == null) {
            throw new NameNotFoundException();
        }
        if (!user.isConnected()) {
            throw new AuthenticationException();
        }

        user.disconnect();
    }

    /**
     * Méthode qui vérifie si le token du client est valide en le comparant avec le
     * token du serveur.
     *
     * @param tokenClient Le token fourni par le client.
     * @param origin      L'origine de la requête.
     *
     * @return true si le token est valide, false sinon.
     */
    public boolean authenticate(String tokenClient, String origin) throws NameNotFoundException {
        String username = userTokenProvider.extractUsername(tokenClient);
        User user = userDao.findOne(username);

        // Vérifie que l'utilisateur est encore connecté.
        if (user == null || !user.isConnected()) {
            return false; // Refuse l'authentification si l'utilisateur est déconnecté.
        }
        return userTokenProvider.validateToken(tokenClient, origin);
    }
}
