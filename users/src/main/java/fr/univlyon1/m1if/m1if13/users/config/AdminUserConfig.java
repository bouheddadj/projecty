package fr.univlyon1.m1if.m1if13.users.config;

import fr.univlyon1.m1if.m1if13.users.dao.UserDao;
import fr.univlyon1.m1if.m1if13.users.model.Species;
import fr.univlyon1.m1if.m1if13.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration de l'utilisateur administrateur.
 */
@Configuration
public class AdminUserConfig {

  @Autowired
  private UserDao userDao;

  @Bean
  public User adminUser() {
    User adminUser = new User("admin", "adminpassword", Species.ADMIN, "admin.png");
    try {
      userDao.add(adminUser);
    } catch (Exception e) {
    }
    return adminUser;
  }
}
