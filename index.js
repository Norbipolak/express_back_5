import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import UserHandler from "./app/userHandler,js"; /*fontos, hogy itt legyen a .js*/
import session from "express-session"

const app = express();

app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.use(urlencoded({extended: true}));
app.use(express.static("assets"));

app.use(session());

app.use(session({
    secret: "asdf",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24*60*60*1000
    }
}));

const uh = new UserHandler();

app.get("/", (req, res)=> {
    res.render("index", {layout: "layouts/public_layout", title: "Kezdőlap", page:"index"});
});

app.post("/regisztracio", async (req, res)=> {
    let response;
    try {
        response = await uh.register(req.body); 
    } catch (err) {
        response = err;
    }

    response.success = response.status.toString(0) === "2";
    /*
        Ezt lehet ilyen formában is írni
        -> 
        response.success = response.status.toString()[0] === "2";
    */

    res.render("register_post", {
        layout: "./layout/public_layout",
        message: response.message,
        title: "Regisztráció",
        page: "regisztracio", 
        success: response.success
    })
});

app.post("/login", async (req, res)=> {
    res.redirect("/profile");
})

app.listen(3000, console.log("the app is listening on localhost:3000"));

/*
    Nincsenek leellenőrizve az adatok, viszont hogyha szeretnénk leellenőrizni az adatokat, akkor valami strukturába 
    kell rendezni a kódot  
    Lesz egy app mappánk és megpróbáljuk osztályokba összeszervezni a hasonló funkciókat! 

    Lesz ebben egy userHandler.js 

    Csináltunk itt egy jelszóHash-t -> const passHash = createHash("sha512").update(req.body.pass).digest("hex");
    Viszont ez majd több helyen fog kelleni, ezért csinálunk egy passHash.js-t amiben egy function lesz 

    Azért amit csináltunk a userHandler.js-ben itt az a post-os regisztrációból csak a render-es rész marad meg 
    ->
    app.post("/regisztracio", async (req, res)=> {

    res.render("register_post", {
        layout: "./layout/public_layout",
        messages: ["helló"],
        title: "Regisztráció",
        page: "regisztracio", 
        success: errors.length === 0
    })
});
    és felül csinálunk egy userHandler-t és mivel ez egy class-t ezt így kell megcsinálni 
    ->
    const uh = new UserHandler(); -> automatikusan ezt behívja -> import UserHandler from "./app/userHandler";

    és itt már nem is kellenek ezek, mert be vannak hívva a userHandler.js-ben!!!! 
    import { createHash } from "crypto";
    import passHash from "./app/passHash";
    csak ezek kellenek majd itt 
    ->
    import express from "express";
    import expressEjsLayouts from "express-ejs-layouts";
    import UserHandler from "./app/userHandler";

    és behívjuk az uh.register-t a post-osban, de mivel itt biztosan kapunk majd hibákat ezért azt kell csinálni, hogy  
    betesszük egy try-catch blokkba 
    app.post("/regisztracio", async (req, res)=> {
    try {
        uh.register();
    } catch () {

    }
    A post-os render-elése jó lenne ha müködne, ezért létrehozunk egy let response-t
    a try-ban megadjuk response-nak a await uh.register-t a req.body-val 
    a response meg az lesz, hogy err 
    ->
    app.post("/regisztracio", async (req, res)=> {
    let response;
    try {
        response = uh.register();
    } catch (err) {
        response = err;
    }
    
    és kérdés, hogy honnan tudjuk, hogy volt-e hiba, vagy nem volt hiba 
    ->
    Onnan tudjuk, hogy a response-nak a status-a 2-es kezdődik 
    ez a status, amit ott visszaadtunk 
    ->
    if(response[0].affectedRows === 1) {
        return {
            status: 201, ...
            
    Ha ez 2-essel kezdődik, akkor biztos, hogy jó volt a dolog 
    -> 
    response.success = response.status.toString(0) === "2";
    Tehát ha a nulladik eleme a response status-ának 2, akkor jó
    és a render-ben a success-nél a response.success-t fogjuk visszaadni 
    meg a message a response.message lesz 
    ->
        res.render("register_post", {
        layout: "./layout/public_layout",
        message: response.message,           * 
        title: "Regisztráció",
        page: "regisztracio", 
        success: response.success             *
    })
    Csak még annyi a probléma, hogy itt a message az egy string -> a userHandler-ben -> message: "A regisztráció sikeres volt!"
    meg ezeknél is 
    -> 
    "A regisztrációs szolgáltatás jelenleg nem érhető el!"
    "A regisztrációs szolgáltatás jelenleg nem elérhető!"

    Itt viszont egy tömb, amit majd megkapunk a checkData-ból ->  errors
    És akkor ezt úgy hidaljuk át, hogy itt is tömböket küldünk majd string-ek helyett
    ->
                if(response[0].affectedRows === 1) {
                return {
                    status: 201,
                    message: ["A regisztráció sikeres volt!"]        * 
                }
            } else {
                throw {
                    status: 503, 
                    message: ["A regisztrációs szolgáltatás jelenleg nem érhető el!"]         *
                }
            }
        } catch(err) {
            console.log("UserHandler.register: ", err);
            throw {
                status: 503,
                message: ["A regisztrációs szolgáltatás jelenleg nem elérhető!"]               *

    De azt is csinálhattuk volna, hogy egy if-vel megnézhettük volna a type-ját a message-nek és aszerint kiírni 
    Itt majd a tömbnek egy eleme lesz, de ez nem baj és akkor ezt egységesen tudjuk majd kezelni 

    A register_post-ban most ez van 
    <div class="container"></div>
    <% message.forEach((m))=> { %>
        <h4 class="error-color"><%=m%></h4>
    <% }) %>
    </div>
    de majd aszerint kellene megcsinálni a color-t, hogy mi volt a success 
    Ha success true volt, akkor color-success ha meg nem akkor meg color-error 
    -> 
    <% message.forEach((m))=> { %>
        <h4 class="<%=success === true ? 'color-success' : 'color-error'%>"><%=m%></h4>    *
    <% }) %>
    ******
    Most az app.post-ban meghívtuk a uh.register(req.body)-t, tehát a class-ban, amit csináltunk -> userHandler, azt itt meghívtuk 
    const uh = new userHandler()
    És ebben a class-ban van egy olyan függvény, hogy register, ezt meghívjuk itt a post-ban és megadjuk neki a req.body-t 
    amiből megszerzi az adatokat, hiszen ott is vár egy paramétert -> async register(user) szóval a user lesz a req.body 
    Ott mi történik 
    -> 
    Van egy checkData, ami ugyanúgy vár egy user-t, tehát a req.body-t és megnézi, hogy jól töltöttük-e ki az adatokat 
    Ha nem, akkor lesz egy tömb, amiben belepusholjuk a hibákat, attól függően, hogy melyiknél volt (email, pass stb.)
    És visszaadjuk (return errors) ezt a tömböt, amiben benne vannak a hibák 
    A register függvényben meghyvjuk ezt és a CheckData, majd onnan fogja megkapni a user-t, amit vár, tehát a req.body-t, mert a regiszer
    meg lesz majd hívva a post-os kérésben, ahol megkapja a req.body-t 
    async register(user) {
        const errors = this.checkData(user);
    Tehát itt az errors-ban majd lesz egy tömb és abban a hibaűzenetekkel, ha valamit rosszul írtunk be és ugye itt van valami az errors-ban 
        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }
    Ezt így nézzük, meg, hogy az errors tömbnek a length-je nagyobb, mint nulla, akkor volt hibánk és ezt ki is fogjuk majd írni 
    úgy, hogy itt még csak throw-olunk egy objektum, amiben van egy status és egy message, ami az errors lesz 
    Ezután van egy try-catch blokk, amiben, megcsináljuk az adatfelvitelt (INSERT)
    -> 
        try {;
            const response = await conn.promise().query(
                `INSERT INTO users (userName, email, pass)
                VALUES(?,?,?)`
                [user.userName, user.email, passHash(user.pass)]
            );

            if(response[0].affectedRows === 1) {
                return {
                    status: 201,
                    message: ["A regisztráció sikeres volt!"]
                }
            } else {
                throw {
                    status: 503, 
                    message: ["A regisztrációs szolgáltatás jelenleg nem érhető el!"]
                }
            }
        } catch(err) {
            console.log("UserHandler.register: ", err);
            throw {
                status: 503,
                message: ["A regisztrációs szolgáltatás jelenleg nem elérhető!"]
            }
        }

    Ugye itt is lehet hibánk az adatfelvitel során, ezért kell a try-catch 
    Ez a függvény meg van hívva itt és átadjuk neki a req.body-t, amit vár ez a függvény egy user paraméterként szóval amiket megkapunk 
    a req.body-ból(userName, email, pass), fontos, hogy a pass-t majd hesh-elni kell, mert úgy fogjuk eltárolni, szóval azok itt 
    elérhetőek, úgyhogy user.userName meg pass meg email, ezeket megadjuk az INSERT-nek
    De itt is lehet hiba és ezt úgy tudjuk megvizsgálni, hogy a response, amiben történt a felvitel az visszaad nekünk egy tömböt, két objektummal
    és az első objektumban response[0] van egy olyan, hogy affectedRows -> ez jelképezi, hogy a table-ben hány rekord(sor) lett érintve 
    ha ez egy if(response[0].affectedRows === 1), akkor return-vel visszaad ez a register függvény egy objektumot, amiben szintén van
    egy status meg egy message 
    De ha viszont nem annyi, akkor tudjuk, hogy valami hiba történt az adatfelvitel során (ez egy szerver hiba), ez van az ELSE ágban 
    ilyenkor throw-olunk egy objektum szintén egy objektummal, ami tartalmazza a megfelelő message-et és status-t 
    Ezt a hibát majd elkapjuk a catch ágban, de ezt majd továbbdobjuk, mert nem itt szeretnénk elkapni, hanem itt az index.js-en 
        } catch(err) {
            console.log("UserHandler.register: ", err);
            throw {
                status: 503,
                message: ["A regisztrációs szolgáltatás jelenleg nem elérhető!"]
        }
    És ami fontos, hogy itt console.log("UserHandler.register: ", err), hogy majd tudjuk ha hiba történt, akkor pontosan hol a kódban!!!! 
    app.post("/regisztracio", async (req, res)=> {
    let response;
    try {
        response = await uh.register(req.body); 
    } catch (err) {
        response = err;
    }
    és majd itt kapjuk el a hibákat és írjuk ki majd a megfelelő ejs oldalra, ha meg nincs hibánk, akkor a try blokkban lefut az INSERT 
    és response az lesz, hogy status: 200 message, meg, hogy minden rendben ment 
    Hogy tudjuk megnézni, hogy sikeres volt-e a felvitel, úgy, hogy amit visszaad objektum-ot a register ott a status 2-es kezdődik 
    ->
    response.success = response.status.toString(0) === "2";
    Itt a reponse-nak csinálunk egy success kulcsot, ami egy boolean lesz és ha status-t átalakítjuk string-é a toString()-vel és ha ennek a 
    nulladik eleme az, hogy "2", akkor true lesz, egyébként meg false 
    -> 
        res.render("register_post", {
        layout: "./layout/public_layout",
        message: response.message,
        title: "Regisztráció",
        page: "regisztracio", 
        success: response.success
    })
    render-nél meg kiírjuk majd a message-t amit kaptunk -> message: response.message
    a success meg azért kell, mert ez alapján lesz meghatározva, hogy a message, amit itt kapunk az milyen színnel lesz kiírva a register_post-ban
    ->
    <div class="container"></div>
    <% message.forEach((m))=> { %>
        <h4 class="<%=success === true ? 'color-success' : 'color-error'%> text-center"><%=m%></h4>
    <% }) %>
    </div>
    Ha minden rendben ment, akkor a success az true és kap majd egy color-success színt egyébként meg hiba volt és kap egy color-error 
    színt 
    *********************
    Regisztráció már meg volt, hogy tudunk bejelentkezni!! 
    Itt lesz a session!!!! 
    A session-nek az a lényege, hogy adatokat tárolunk a felhasználóról méghozzá, olyan formában, hogy a szerveren vagy a memóriában 
    vagy fájlrendszerben vagy adatbázisban 
    A felhasználó kap egy cookie-t a böngészőjébe egy id-val 
    Tehát van a session adat az adatbázisban, aminek van egy id-ja, egy egyedi azonosítója  
    És ezt id-t egy cookie-ban elküldi a szerver a kliensnek (de csak ezt az id-t)
    Amikor a kliens az id-t visszaküldi a szervernek, akkor a szerver tudni fogja, hogy a felhasználó be van-e jelentkezve vagy sem!!!!!! 

    Ez egy alapvető jogosultságellenőrzési metódus és nem is túl biztonságos, hogy a böngészőben egy külső programmal (egy Chrome kiegészítővel)
    el lehet lopni a session-öket, de nekünk ez egy egyszerű rendszer és ez elég lesz 

    A session-ben lehet tárolni a userName-t, id-t, email-t, isAdmin-t 
    De a kliens csak egy id-t fog innen megkapni és azt küldözgeti vissza a HTTP kéréseknél teljesen automatikusan és innen tudja a szerver 
    hogy be van-e jelentkezve az adott user vagy sem 
    Ha meg be van jelenkezve, akkor milyen jogosultságokkal rendelkezik és egyáltalán ki ő 
    -> 
    Ezt a funkciót az express.session-vel lehet elérni, ezért nem kell leprogramoznunk 
    -> 
    npm i express-session
    -> 
    import session from "express-session"
    ->
    app.use(session());
    Ez azért egy kicsit megtévesztő, mert az app.use() az alapból egy metódus 
    A metódus ezt a függvény-t fogja nekünk meghívni, hogy sessio(), a függvény meg kér egy objektumot, ami meg a beállítási paraméterek
    ->
    app.use(session({
        secret: ""
    }))
    Ilyen beállítása paraméter, az, hogy secret
    Ez egy olyan string lesz értéke, ami session-nek a titkosításához való, tehát, hogy ne lehessen feltörni vagy ellopni a session-t 
    Ezzel titkosítjuk az adatokat, ez jó ha egy random generált string, de nekünk itt elég, hogy asdf, mert ez nem egy éles rendszer 
    ->
    app.use(session({
        secret: "asdf",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 24*60*60*1000
        }
    }))
    Minden felhasználónak ugye külön session-je lesz 
    resave: false -> Ha nem változótt a session értéke, akkor nem menti el újra, tehát nem írja felül a memóriában a session-t 
    saveUninitialized: false -> Az üres, még fel nem használt session-öket elmenti-e, false-nál nem menti el és ne használjuk feleslegesen 
        a memóriát arra, hogy üres adatokat tároljunk 
    Ennek van még egy cookie komponense -> ez az amit a felhasználó megkap 
    1. secure
        itt be lehet állítani azt, hogy secure: false/true -> https-en keresztük mozog-e vagy sem 
        tehát csak titkosított csatornán hajlandó-e mozogni vagy nem 
        Ha azt írjuk, hogy true, akkor csak titkosítottan hajlandó nekünk mozogni (https) és nekünk nincs titkosításunk, tehát false 
        Éles rendszerben ez true 
    2. maxAge
        itt azt lehet beállítani, hogy meddig éljen a cookie (milliszekundumra lehet megadni)
        így lehet beállítani egy napot -> maxAge: 24*60*60*1000

    Ezzel inicializáltuk az egészet, de még nem készült el semmilyen session, kizárólag csak annyi történt, hogy ezekkel a beállításokkal 
    fognak elkészülni a session-ök 

    És mi csak akkor fogjuk megcsinálni a session-t, hogyha a success az true a post-ban!!!!!!!!!!!!!!!!!!!!!!!!!
    de fontos, hogy ezt a login-nál kell majd megcsinálni!!!! 

    Ezt a login-t, tehát a userHandler-ben a login metódust kidolgozzuk, nagyon hasonló lesz, mint a register 
        const response = await conn.promise().query(
            `SELECT * FROM users WHERE email = ? AND pass = ?`,
            [user?.email, passHash(user?.pass)]

    Ez a rész, viszont más lesz, mert nem az INSERT-vel akarunk felvinni adatokat, hanem az adatbázisban már fent vannak ezek az adatok 
    és innen akarjuk őket majd leszedni (SELECT) és összehasonlítani azzal, amit a user beírt 
    Ami nagyon fontos, hogy a user által beírt jelszót is passHash()-elni kell, mert azt fogjuk majd összehasonlítani az adatbázisban 
    lévő jelszóval, amit ott hash-elve van elmentve!!! 
    Miért kell a kérdőjel -> user?.email, passHash(user?.pass)
    Mert lehet, hogy ezek nem léteznek, de ha van ?, akkor azért nem lesz gond, mert ha null vagy undefined az értéke, akkor nem dob hibát!!!!

    utána van egy ilyen, hogy if(response[0].length === 1)
    Ez azt jelenti, hogy a visszahozott rekordok száma az pontosan 1, akkor jól írta be jelen esetben a felhasználónevet, jelen esetben a 
    az email-t és a jelszót 
    És az a jó, hogy majd szükségünk van az azonosításkor a userID-re, meg ha köszönteni akarjuk a felhasználót, akkor a userName-re 
    Akkor nem mindent szedünk le a lekérdezésben csak a userName-t meg a userID-t 
    -> 
    `SELECT * FROM users WHERE email = ? AND pass = ?` -> `SELECT userName, userID FROM users WHERE email = ? AND pass = ?`
    a return-ben visszadjuk 
        {
            status: 200,
            message: response[0] -> itt megkaptuk az adatokat, amikre szükségünk van a session létrehozására 
        }
    hogyha valami hiba történt, akkor azt kell monddani az ELSE ágban, hogy throw (de lehet return is)
    return {
            status: 200,
            message: response[0] -> itt megkaptuk az adatokat, amikre szükségünk van a session létrehozására 
        } else {
            throw {
                status: 401, -> unauthorized
                message: ["Nem megfelelő felhasználó/jelszó páros"]
            }
        }

    } catch (err) {
        console.log("UserHandler.login: ", err);

        if(err.status) {
            throw err;
        }

        throw {
            status: 503,
            message: ["A bejelentkezés szolgáltatás jelenleg nem elérhető!"]
        }

    Tehát ha van status-a, akkor biztos, hogy itt dobtuk és tovább kell majd dobni 
    És csak, akkor mondjuk, hogy a ["A bejelentkezés szolgáltatás jelenleg nem elérhető!"]
    Hogyha nem innen ered a hiba ->                 
        throw {
                status: 401, 
                message: ["Nem megfelelő felhasználónév/jelszó páros!"]
            }
    Mert ha innen ered a hiba, akkor van egy olyanja, hogy status és nem a bejelentkezési szolgáltatással van a probléma
    tehát ha van egy olyanja, hogy status az err-nek, akkor továbbdobjuk 
    ->  if(err.status) {
            throw err;
        }
    *******
    Csinálunk itt egy post-os endpoint-ot erre!!!!!! 
    És ha minden rendben lesz, akkor redirect-elünk 
*/ 
