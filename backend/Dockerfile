# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy entire repository source context
COPY . .

# Build backend jar (finds pom.xml wherever context is root or backend)
RUN if [ -f "pom.xml" ]; then mvn -B clean package -DskipTests; else cd backend && mvn -B clean package -DskipTests; fi

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# OpenCV native dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app /app_build
RUN find /app_build -name "*.jar" -not -name "*sources.jar" -exec cp {} /app/app.jar \; && rm -rf /app_build

RUN mkdir -p /app/models /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
