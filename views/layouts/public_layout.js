<!DOCTYPE html>
<html lang="en">
<%-include("../common/head", {title: title})%>
<body>
    <nav>
        <ul>
            <li class="<%=page === 'index' ? 'selected-menu' : '' %>">
                <a href="/">Kezdőlap</a>
            </li>
            <li class="<%=page === 'regisztracio' ? 'selected-menu' : '' %>">
                <a href="/regisztracio">Regisztráció</a>
            </li>
            <li class="<%=page === 'bejelentkezes' ? 'selected-menu' : '' %>">
                <a href="/bejelentkezes">Bejelentkezés</a>
            </li>
        </ul>
    </nav>

    <%-body%>
</body>
</html>