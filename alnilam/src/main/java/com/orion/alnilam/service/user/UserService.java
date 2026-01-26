package com.orion.alnilam.service.user;

import com.orion.alnilam.domain.company.Company;
import com.orion.alnilam.domain.enums.Role;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.request.UserCreateRequest;
import com.orion.alnilam.dto.request.UserDeleteRequest;
import com.orion.alnilam.dto.request.UserStatusRequest;
import com.orion.alnilam.dto.request.UserUpdateRequest;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.dto.response.UserDeviceResponse;
import com.orion.alnilam.dto.response.UserResponse;
import com.orion.alnilam.repository.UserRepository;
import com.orion.alnilam.service.audit.AuditLogService;
import java.util.HashMap;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import com.orion.alnilam.repository.CompanyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
    private static final String SUPER_ADMIN_EMAIL = "super.admin@example.com";
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserService(
        CompanyRepository companyRepository,
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuditLogService auditLogService
    ) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public PagedResponse<UserResponse> list(int page, int pageSize, String sort) {
        int safePage = Math.max(page, 0);
        int safePageSize = Math.max(pageSize, 1);

        List<User> users = userRepository.findAll();
        Map<Long, String> companyNames = resolveCompanyNames(users);

        List<UserResponse> responses = users.stream()
            .map(user -> {
                Long companyId = user.getCompanyId();
                String companyName = companyId == null ? null : companyNames.get(companyId);
                return toResponse(user, companyName);
            })
            .sorted(buildUserComparator(sort))
            .toList();

        long total = responses.size();
        int fromIndex = safePage * safePageSize;
        if (fromIndex >= total) {
            return new PagedResponse<>(List.of(), safePage, safePageSize, total);
        }
        int toIndex = Math.min(fromIndex + safePageSize, responses.size());
        List<UserResponse> items = responses.subList(fromIndex, toIndex);
        return new PagedResponse<>(items, safePage, safePageSize, total);
    }

    public UserResponse create(UserCreateRequest request) {
        Set<Role> targetRoles = rolesForActor();
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
        user.setRoles(targetRoles);
        user.setActive(request.isActive());
        User saved = userRepository.save(user);
        return toResponse(saved, resolveCompanyName(saved.getCompanyId()));
    }

    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        enforceActorCanManage(user);

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
        user.setActive(request.isActive());
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User saved = userRepository.save(user);
        auditLogService.log("USER", saved.getId(), "UPDATE", request.getReason());
        return toResponse(saved, resolveCompanyName(saved.getCompanyId()));
    }

    public void deleteBulk(UserDeleteRequest request) {
        List<User> users = userRepository.findAllById(request.getUserIds());
        if (users.size() != request.getUserIds().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more users not found");
        }
        if (users.stream().anyMatch(this::isProtectedUser)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "super.admin@example.com cannot be deleted"
            );
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
        if (!request.isActive() && users.stream().anyMatch(this::isProtectedUser)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "super.admin@example.com cannot be deactivated"
            );
        }
        for (User user : users) {
            user.setActive(request.isActive());
        }
        List<User> saved = userRepository.saveAll(users);
        String action = request.isActive() ? "ACTIVATE" : "DEACTIVATE";
        for (User user : saved) {
            auditLogService.log("USER", user.getId(), action, request.getReason());
        }
        Map<Long, String> companyNames = resolveCompanyNames(saved);
        return saved.stream()
            .map(user -> toResponse(user, companyNames.get(user.getCompanyId())))
            .toList();
    }

    public List<UserDeviceResponse> listDevices(Long userId) {
        userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        // Device tracking is not implemented yet.
        return Collections.emptyList();
    }

    private Set<Role> rolesForActor() {
        Set<Role> actorRoles = currentRoles();

        if (actorRoles.contains(Role.SUPER_ADMIN)) {
            return Set.of(Role.COMPANY_ADMIN);
        }

        if (actorRoles.contains(Role.COMPANY_ADMIN)) {
            return Set.of(Role.COMPANY_USER);
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to manage users");
    }

    private void enforceActorCanManage(User user) {
        Set<Role> actorRoles = currentRoles();
        Set<Role> targetRoles = user.getRoles();

        if (actorRoles.contains(Role.SUPER_ADMIN)) {
            if (!targetRoles.equals(Set.of(Role.COMPANY_ADMIN))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "SUPER_ADMIN can only manage COMPANY_ADMIN users");
            }
            return;
        }

        if (actorRoles.contains(Role.COMPANY_ADMIN)) {
            boolean allowed = targetRoles.stream().allMatch(role ->
                role == Role.COMPANY_USER || role == Role.COMPANY_PILOT_USER
            );
            if (!allowed) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "COMPANY_ADMIN can only manage COMPANY_USER roles");
            }
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to manage users");
    }

    private Set<Role> currentRoles() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return Set.of();
        }
        return authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(value -> value.startsWith("ROLE_"))
            .map(value -> value.substring("ROLE_".length()))
            .map(Role::valueOf)
            .collect(Collectors.toSet());
    }

    private boolean isProtectedUser(User user) {
        return user.getEmail() != null && user.getEmail().equalsIgnoreCase(SUPER_ADMIN_EMAIL);
    }

    private Map<Long, String> resolveCompanyNames(List<User> users) {
        List<Long> companyIds = users.stream()
            .map(User::getCompanyId)
            .filter(id -> id != null)
            .distinct()
            .toList();
        if (companyIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, String> companyNames = new HashMap<>();
        for (Company company : companyRepository.findAllById(companyIds)) {
            companyNames.put(company.getId(), company.getName());
        }
        return companyNames;
    }

    private String resolveCompanyName(Long companyId) {
        if (companyId == null) {
            return null;
        }
        return companyRepository.findById(companyId)
            .map(Company::getName)
            .orElse(null);
    }

    private UserResponse toResponse(User user, String companyName) {
        return new UserResponse(
            user.getId(),
            user.getCompanyId(),
            companyName,
            user.getUsername(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getPhone(),
            user.getRoles(),
            user.isActive()
        );
    }

    private Comparator<UserResponse> buildUserComparator(String sort) {
        String[] parts = sort == null ? new String[0] : sort.split(",", 2);
        String field = parts.length > 0 ? parts[0].trim() : "email";
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "asc";

        Comparator<String> textComparator = Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER);
        Comparator<UserResponse> comparator;

        switch (field) {
            case "fullName":
                comparator = Comparator.comparing(this::fullNameForSort, textComparator);
                break;
            case "companyName":
                comparator = Comparator.comparing(UserResponse::getCompanyName, textComparator);
                break;
            case "active":
                comparator = Comparator.comparing(UserResponse::isActive);
                break;
            case "email":
            default:
                comparator = Comparator.comparing(UserResponse::getEmail, textComparator);
                break;
        }

        if ("desc".equals(direction)) {
            comparator = comparator.reversed();
        }
        return comparator;
    }

    private String fullNameForSort(UserResponse user) {
        String firstName = user.getFirstName() == null ? "" : user.getFirstName();
        String lastName = user.getLastName() == null ? "" : user.getLastName();
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? null : fullName;
    }
}
