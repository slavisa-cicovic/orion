package com.orion.alnilam.config;

import com.orion.alnilam.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class RestExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
        ResponseStatusException ex,
        HttpServletRequest request
    ) {
        HttpStatusCode status = ex.getStatusCode();
        String error = status instanceof HttpStatus httpStatus
            ? httpStatus.getReasonPhrase()
            : status.toString();

        ErrorResponse body = new ErrorResponse(
            status.value(),
            error,
            ex.getReason(),
            request.getRequestURI(),
            Instant.now()
        );

        return ResponseEntity.status(status).body(body);
    }
}
