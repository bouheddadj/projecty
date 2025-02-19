package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration de l'utilisateur administrateur.
 */
@Configuration
public class AdminUserConfig {

    @Bean
    public User adminUser(UserDao userDao) { // Injecter UserDao directement dans le bean
        User adminUser = new User("admin", "adminpassword", Species.ADMIN, "admin.png");
        try {
            if (userDao.findOne("admin") == null) { // Vérifier si l'utilisateur existe déjà
                userDao.add(adminUser);
            }
        } catch (Exception ignored) {
        }
        return adminUser;
    }
}
