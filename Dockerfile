# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy entire repository source context
COPY . .

# Build backend jar
RUN if [ -d "backend" ]; then cd backend && mvn -B clean package -DskipTests; else mvn -B clean package -DskipTests; fi

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# OpenCV native dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/backend/target/*.jar app.jar

RUN mkdir -p /app/models /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
