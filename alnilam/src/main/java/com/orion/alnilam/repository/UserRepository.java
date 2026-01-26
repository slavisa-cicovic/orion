package com.orion.alnilam.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.orion.alnilam.domain.user.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
}
