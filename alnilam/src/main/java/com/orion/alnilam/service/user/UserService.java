package com.orion.alnilam.service.user;

import com.orion.alnilam.domain.enums.Role;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.request.UserCreateRequest;
import com.orion.alnilam.dto.request.UserDeleteRequest;
import com.orion.alnilam.dto.request.UserStatusRequest;
import com.orion.alnilam.dto.request.UserUpdateRequest;
import com.orion.alnilam.dto.response.UserDeviceResponse;
import com.orion.alnilam.dto.response.UserResponse;
import com.orion.alnilam.repository.UserRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuditLogService auditLogService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public List<UserResponse> list() {
        return userRepository.findAll().stream()
            .map(this::toResponse)
            .toList();
    }

    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setCompanyId(request.getCompanyId());
        user.setRoles(normalizeRoles(request.getRoles()));
        user.setActive(request.isActive());
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getUsername().equalsIgnoreCase(request.getUsername())
            && userRepository.existsByUsernameIgnoreCase(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
            && userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setCompanyId(request.getCompanyId());
        if (request.getRoles() != null) {
            user.setRoles(normalizeRoles(request.getRoles()));
        }
        user.setActive(request.isActive());
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        auditLogService.log("USER", saved.getId(), "UPDATE", request.getReason());
        return toResponse(saved);
    }

    public void deleteBulk(UserDeleteRequest request) {
        List<User> users = userRepository.findAllById(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more users not found");
        }
        userRepository.deleteAll(users);
        for (User user : users) {
            auditLogService.log("USER", user.getId(), "DELETE", request.getReason());
        }
    }

    public List<UserResponse> updateStatusBulk(UserStatusRequest request) {
        List<User> users = userRepository.findAllById(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more users not found");
        }
        for (User user : users) {
            user.setActive(request.isActive());
        }
        List<User> saved = userRepository.saveAll(users);
        String action = request.isActive() ? "ACTIVATE" : "DEACTIVATE";
        for (User user : saved) {
            auditLogService.log("USER", user.getId(), action, request.getReason());
        }
        return saved.stream().map(this::toResponse).toList();
    }

    public List<UserDeviceResponse> listDevices(Long userId) {
        userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        // Device tracking is not implemented yet.
        return Collections.emptyList();
    }

    private Set<Role> normalizeRoles(Set<Role> roles) {
        if (roles == null) {
            return Set.of();
        }
        if (roles.contains(Role.COMPANY_PILOT_USER)) {
            roles = Set.copyOf(roles);
            if (!roles.contains(Role.COMPANY_USER)) {
                roles = new java.util.HashSet<>(roles);
                roles.add(Role.COMPANY_USER);
            }
        }
        return roles;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getCompanyId(),
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhone(),
            user.getRoles(),
            user.isActive()
        );
    }
}
