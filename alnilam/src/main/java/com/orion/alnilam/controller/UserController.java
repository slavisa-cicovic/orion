package com.orion.alnilam.controller;

import com.orion.alnilam.dto.request.UserCreateRequest;
import com.orion.alnilam.dto.request.UserDeleteRequest;
import com.orion.alnilam.dto.request.UserStatusRequest;
import com.orion.alnilam.dto.request.UserUpdateRequest;
import com.orion.alnilam.dto.response.PagedResponse;
import com.orion.alnilam.dto.response.UserDeviceResponse;
import com.orion.alnilam.dto.response.UserResponse;
import com.orion.alnilam.service.user.UserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<UserResponse>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int pageSize,
        @RequestParam(defaultValue = "email,asc") String sort,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(userService.list(page, pageSize, sort, search, isActive));
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(userService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody UserUpdateRequest request
    ) {
        return ResponseEntity.ok(userService.update(id, request));
    }

    @DeleteMapping
    public ResponseEntity<Void> delete(@Valid @RequestBody UserDeleteRequest request) {
        userService.deleteBulk(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/status")
    public ResponseEntity<List<UserResponse>> updateStatus(@Valid @RequestBody UserStatusRequest request) {
        return ResponseEntity.ok(userService.updateStatusBulk(request));
    }

    @GetMapping("/{id}/devices")
    public ResponseEntity<List<UserDeviceResponse>> devices(@PathVariable Long id) {
        return ResponseEntity.ok(userService.listDevices(id));
    }
}
