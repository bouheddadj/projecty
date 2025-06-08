package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration de l'utilisateur administrateur.
 */
@Configuration
public class AdminUserConfig {

    @Bean
    public User adminUser(UserDao userDao) throws NameAlreadyBoundException {
        User adminUser = new User("admin", "admin", Species.ADMIN, "admin.png");
        try {
            userDao.findOne(adminUser.getLogin());
        } catch (NameNotFoundException e) {
            userDao.add(adminUser);
        } catch (Exception e) {
        }
        return adminUser;
    }
}
