package com.orion.alnilam.service.mobile;

import com.orion.alnilam.domain.enums.RegistrationStatus;
import com.orion.alnilam.domain.enums.Role;
import com.orion.alnilam.domain.registration.RegistrationRequest;
import com.orion.alnilam.domain.user.User;
import com.orion.alnilam.dto.request.MobileRegistrationDecisionRequest;
import com.orion.alnilam.dto.response.MobileRegistrationRequestResponse;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.repository.RegistrationRequestRepository;
import com.orion.alnilam.repository.UserRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MobileRegistrationRequestService {
    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;

    public MobileRegistrationRequestService(
        RegistrationRequestRepository registrationRequestRepository,
        UserRepository userRepository
    ) {
        this.registrationRequestRepository = registrationRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<MobileRegistrationRequestResponse> listPending(
        int page,
        int pageSize,
        String search,
        Authentication authentication
    ) {
        User actor = getAuthenticatedUser(authentication);
        ensureCompanyAdmin(authentication);

        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        String needle = search == null ? "" : search.trim().toLowerCase();

        List<MobileRegistrationRequestResponse> filtered = registrationRequestRepository
            .findByCompanyIdAndStatus(companyId, RegistrationStatus.PENDING).stream()
            .filter(request -> {
                if (needle.isEmpty()) {
                    return true;
                }
                String haystack = ((request.getFirstName() == null ? "" : request.getFirstName()) + " "
                    + (request.getLastName() == null ? "" : request.getLastName()) + " "
                    + (request.getEmail() == null ? "" : request.getEmail()) + " "
                    + (request.getPhone() == null ? "" : request.getPhone())).toLowerCase();
                return haystack.contains(needle);
            })
            .sorted(Comparator.comparing(RegistrationRequest::getRequestedAt).reversed())
            .map(request -> new MobileRegistrationRequestResponse(
                request.getId(),
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getRequestedAt()
            ))
            .toList();

        int safePage = Math.max(0, page);
        int safePageSize = Math.min(200, Math.max(1, pageSize));
        int fromIndex = safePage * safePageSize;
        if (fromIndex >= filtered.size()) {
            return new PagedResponse<>(List.of(), safePage, safePageSize, filtered.size());
        }
        int toIndex = Math.min(filtered.size(), fromIndex + safePageSize);
        return new PagedResponse<>(filtered.subList(fromIndex, toIndex), safePage, safePageSize, filtered.size());
    }

    @Transactional
    public void process(
        Long requestId,
        MobileRegistrationDecisionRequest decision,
        Authentication authentication
    ) {
        User actor = getAuthenticatedUser(authentication);
        ensureCompanyAdmin(authentication);

        Long companyId = actor.getCompanyId();
        if (companyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not assigned to company");
        }

        RegistrationRequest request = registrationRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration request not found"));

        if (!companyId.equals(request.getCompanyId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Request does not belong to your company");
        }

        if (request.getStatus() != RegistrationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration request is already processed");
        }

        boolean approve = Boolean.TRUE.equals(decision.approve());
        if (approve) {
            createUserFromRequest(request, actor.getId(), Boolean.TRUE.equals(decision.pilotUser()));
            request.setStatus(RegistrationStatus.APPROVED);
        } else {
            request.setStatus(RegistrationStatus.REJECTED);
        }

        request.setDecidedById(actor.getId());
        request.setDecidedAt(Instant.now());
        registrationRequestRepository.save(request);
    }

    private void createUserFromRequest(RegistrationRequest request, Long actorId, boolean pilotUser) {
        String email = request.getEmail();
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration request email is invalid");
        }

        if (userRepository.existsByEmailIgnoreCase(email.trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with this email already exists");
        }

        String username = email.trim();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User with this username already exists");
        }

        User user = new User();
        user.setCompanyId(request.getCompanyId());
        user.setUsername(username);
        user.setEmail(email.trim());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setPasswordHash(request.getPasswordHash());
        user.setCreatedById(actorId);
        user.setUpdatedById(actorId);
        user.setActive(true);

        Set<Role> roles = pilotUser
            ? Set.of(Role.COMPANY_USER, Role.COMPANY_PILOT_USER)
            : Set.of(Role.COMPANY_USER);
        user.setRoles(roles);

        userRepository.save(user);
    }

    private void ensureCompanyAdmin(Authentication authentication) {
        Set<Role> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(authority -> authority.startsWith("ROLE_") ? authority.substring(5) : authority)
            .map(Role::valueOf)
            .collect(Collectors.toSet());

        if (!roles.contains(Role.COMPANY_ADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only COMPANY_ADMIN can process registration requests");
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Long userId;
        Object principal = authentication.getPrincipal();
        if (principal instanceof Number number) {
            userId = number.longValue();
        } else {
            try {
                userId = Long.valueOf(principal.toString());
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }
        }

        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));
    }
}
