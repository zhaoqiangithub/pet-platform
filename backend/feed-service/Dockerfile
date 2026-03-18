# 多阶段构建 Dockerfile - feed-service
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B || true
COPY src src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# 环境变量
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

EXPOSE 8085

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8085/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
