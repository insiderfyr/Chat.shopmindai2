# Gateway Configuration

This directory contains the configuration for the API Gateway, which is managed by Kong.

## Services and Routes

### Auth Service

- **Service URL:** `http://shopmind-auth-service:8080`
- **Routes:**
    - `/api/v1/auth` (Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS)
    - `/api/v1/user` (Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS)
    - `/api/auth` (Methods: GET, POST, OPTIONS)

### Mock API

- **Service URL:** `http://host.docker.internal:3080`
- **Routes:**
    - `/api` (Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS)
    - `/orchestrator` (Methods: GET, POST, OPTIONS)
    - `/llm` (Methods: GET, POST, OPTIONS)
    - `/chat` (Methods: GET, POST, OPTIONS)

## Global Plugins

- **CORS:** Allows cross-origin requests from any domain.
- **Correlation ID:** Adds a unique `X-Request-ID` header to each request for traceability.
