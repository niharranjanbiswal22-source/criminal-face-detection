# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY backend/pom.xml ./
COPY backend/src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# OpenCV native dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/face-recognition.jar app.jar

RUN mkdir -p /app/models /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
