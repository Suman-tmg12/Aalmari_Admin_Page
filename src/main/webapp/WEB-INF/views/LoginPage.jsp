<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" language="java" isELIgnored="true" %>
<%@ page import="org.springframework.security.web.csrf.CsrfToken" %>
<%
    CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <title>Admin Sign In | Aalmari</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/css/LoginPage.css">
</head>
<body>
<main class="login-card">
    <div class="brand">AALMARI <span>ADMIN PORTAL</span></div>
    <h1>Sign in</h1>
    <p class="intro">Use your administrator account to continue.</p>

    <% if (request.getParameter("error") != null) { %>
    <p class="message error" role="alert">Sign-in failed. Check your username and password.</p>
    <% } %>
    <% if (request.getParameter("logout") != null) { %>
    <p class="message success" role="status">You have been signed out.</p>
    <% } %>
    <% if (request.getParameter("expired") != null) { %>
    <p class="message error" role="alert">This sign-in form expired. Please try again.</p>
    <% } %>

    <form action="<%= request.getContextPath() %>/login" method="post">
        <% if (csrfToken != null) { %>
        <input type="hidden" name="<%= csrfToken.getParameterName() %>" value="<%= csrfToken.getToken() %>">
        <% } %>
        <label for="username">Username</label>
        <input id="username" name="username" type="text" autocomplete="username" required autofocus>

        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>

        <button type="submit">Sign in</button>
    </form>
</main>
</body>
</html>
