FROM maven:3.8-openjdk-8 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package

FROM amazoncorretto:8
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
CMD ["java", \
     "-Dlog4j2.disable.jmx=true", \
     "-Dcom.sun.jndi.ldap.object.trustURLCodebase=true", \
     "-Dcom.sun.jndi.rmi.object.trustURLCodebase=true", \
     "-jar", "app.jar"]