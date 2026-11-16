# i27CoreHR — single container running the whole app (UI baked into the API jar).
#
# Build context must be the REPO ROOT, since this needs both frontend/ and backend/. From the
# repo root:
#
#   docker build -t i27corehr:latest .
#
# Run it (pointed at a reachable MySQL — see docker/docker-compose.yml for a full local stack
# that includes MySQL, or local.md for a no-Docker walkthrough of the same jar):
#
#   docker run -p 8080:8080 \
#     -e DB_HOST=host.docker.internal -e DB_PASSWORD=... -e JWT_SECRET=... \
#     i27corehr:latest
#
# Mirrors spec §30 (Phase 10 — Containerization): same jar as the no-Docker deployment, just
# packaged as an image. No microservices, no redesign.

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Warm the Maven dependency cache from just the POM first, so editing app source doesn't bust it.
COPY backend/pom.xml backend/pom.xml
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f backend/pom.xml -B dependency:go-offline -DskipTests || true

COPY frontend/ frontend/
COPY backend/ backend/

# frontend-maven-plugin (bound to backend/pom.xml) builds the React app and bakes frontend/dist
# into the jar's static resources as part of this one `mvn package`.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f backend/pom.xml -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine-3.21 AS runtime

RUN addgroup -S i27corehr && adduser -S i27corehr -G i27corehr
WORKDIR /app

COPY --from=build /workspace/backend/target/i27corehr-backend.jar app.jar
RUN mkdir -p /app/data/documents && chown -R i27corehr:i27corehr /app

USER i27corehr
EXPOSE 8080

ENV DOCUMENT_LOCAL_PATH=/app/data/documents \
    SERVER_PORT=8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=45s --retries=3 \
    CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
