import conn from "./conn.js";
import nullOrUndefined from "./nullOrUndefined.js";
import passHash from "./passHash.js";

class UserHandler {
    checkData(user) {
        const errors = [];
        const emailRegex = /^[\w\_\-\.]{1,255}\@[\w\_\-\.]{1,255}\.[\w]{2,8}$/;

        if(nullOrUndefined(user.email) || !emailRegex.test(user.email)) {
            errors.push("A megadott email cím nem megefelelő!");
        }

        if(nullOrUndefined(user.pass) || user.pass.length < 8) {
            errors.push("A jelszónak legalább 8 karakteresnek kell lennie!");
        }
        /*
            user.pass.length > 8 érdemes olyan jelszót megkövetelni a felhasználótól, ami egy minimálisan is biztonságos -> user.pass.length > 8
        */

        if(nullOrUndefined(user.userName) || user.userName < 5) { //legyen legalább 5 karakteres a userName 
            errors.push("A felhasználónévnek legalább 5 karakteresnek kell lennie!");
        } 

        if(user.pass !== user.passAgain) {
            errors.push("A jelszó nem egyezik!")
        }
            
        return errors;
    }

    async register(user) {
        const errors = this.checkData(user);
        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

        try {
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
    }

    async login(user) {
        try {
            const response = await conn.promise().query(
                `SELECT * FROM users WHERE email = ? AND pass = ?`,
                [user.email, passHash(user.pass)]
            )

            if(response[0] === 1) {
                return {
                    status: 200,
                    message: response[0]
                }
            } else {
                throw {
                    status: 401, 
                    message: ["Nem megfelelő felhasználónév/jelszó páros!"]
                }
            }
        } catch (err) {
            console.log("UserHandler.login: ", err);

            if(err.status) {
                throw err;
            }

            throw {
                status: 503,
                message: ["A bejelentkezési szolgáltatás jelenleg nem elérhető!"]
            }
        }
    }

    async search() {

    }

}

export default UserHandler;

/*
    Milyen funkciókra van szüksége egy felhasználó kezelő osztálynak
    Elöször is biztos, hogy importálni kell a conn-t, itt ami nagyon fontos, hogy be legyen írva a .js, 
    mert különben nem találja meg az útvonalat, automatikusan valamiért .js nélkül hívja be!! 
    -> 
    import conn from "./conn.js";

    Milyen metódusok kellenek ide 
    1. register 
    2. login
    3. search ahol majd az admin ki tudja listázni a felhasználókat 
    ->
class userHandler {
    async register() {

    }

    async login() {

    }

    async search() {

    }
}

    Ha már regisrációról van szó, akkor itt biztos kell majd nekünk a passHash -> import passHash from "./passHash.js";

    Biztosan kell majd egy olyan függvény, ami majd leellenőrizi az adatokat, hogy helyesek-e és hogy úgy nem menjen be az adatbázisba 
    -> 
    checkData(user) {

    }
    Csinálunk egy errors tömböt, amit majd return-elünk!! 
    és hogyha a user.email === undefined vagy a user.email === null vagy hogyha a regurális kifejezésnek nem felel meg, 
    amit az index.js-en csináltunk -> !emailRegex.test(user.email)
    Ha ez van, akkor egy push-val bele is tesszük az errors-ba egy hibaüzenetet 
    és ugyanezt megcsináljuk a pass-ra is 
        const errors = [];
        const emailRegex = /^[\w\_\-\.]{1,255}\@[\w\_\-\.]{1,255}\.[\w]{2,8}$/;

        if(user.email === undefined || user.email === null 
            || !emailRegex.test(user.email)) 
            {
                errors.push("A megadott email cím nem megefelelő!");
            }

        if(user.pass === undefined || user.email === null)

    Itt látható már az, hogy undefined meg null és ugyanaz naggyábból mindegyiknél, akkor miért irogatjuk ezeket így végig ha ugyanaz 
    Csinálunk egy olyat, hogy nullOrUndefined.js 
    -> 
    ami egy függvény, ami vár egy data-t 
    return data === undefined || data === null || data.length === 0;
    és ezt itt fel tudjuk használni, meghívni 
    ->
        if(nullOrUndefined(user.email) || !emailRegex.test(user.email)) {
            errors.push("A megadott email cím nem megefelelő!");
        }

        if(nullOrUndefined(user.pass) || user.pass.length < 8) {
            errors.push("A jelszónak legalább 8 karakteresnek kell lennie!");
        }
    
    Azért is jó ez a null vagy undefined-os dolog, mert ha véletlen megpróbálnánk, hogyha a userName az null és annak a length-je 
    akkor kapnánk is ott a hibát, mert a null-nak nincsen length tulajdonsága, a nullnak semmilyen tulajdonságot nem tudunk meghívni, mert
    null az null az undefined meg ugyanaz 

    Direkt van a register.ejs-ben egy olyan, hogy pass meg passAgain 
    -> 
        <h3>Jelszó</h3>
        <input name="pass" type="password">

        <h3>Jelszó újra</h3>
        <input name="passAgain" type="password">

    mert ilyenkor ezt tudjuk mondani, hogyha nem egyezik a két jelszó, akkor hibaüzenet
    ->
        if(user.pass !== user.passAgain) {
            errors.push("A jelszó nem egyezik!")
        }
    Itt is felmerül, hogyha a pass meg a passAgain is undefined vagy null lenne, akkor nem írná ki, hogy nem egyezik 
    de viszont, akkor már kiírná emiatt, hogy a jelszónak legalább 8 karakteresnek kell lennie 
    ->
        if(nullOrUndefined(user.pass) || user.pass.length < 8) {
            errors.push("A jelszónak legalább 8 karakteresnek kell lennie!");
        }

    ************************************
    Átmegyünk a register függvény-re, ami szinén vár egy user-t -> async register(user) {
    Itt csinálunk egy try-catch blokkot!!!! 
    -> 
        async register(user) {
        try {
            const errors = this.checkData(user);
        } catch(err) {

        }
    }
    ******
    A checkData visszaad egy tömböt, ami tartalmazza a hibákat. 
    Miért hívjuk meg a checkData függvényt a register függvényben 
    A regisztrációs folyamat során fontos, hogy mielött a felhasználó adatait továbbíjuk az adatbázisba 
    megbizonyosodjunk róla, hogy az adatok helyesek. 
    A checkData függvényben ellenőrizzük, hogy az email cím, jelszó stb megfelel-e a követelményeknek 
    Ha a checkData hibákat talál, ezek a hibák alapján dönthetjük el, hogy visszaküldjük a felhasználónak, hogy javítsa az adatokat

    Register függvény mükődése 
    1. Adatok ellenőrzése 
        A register függvényen belül meghívjuk a checkData(user) függvényt, hogy ellenőrizzük, hogy vannak-e hibák. Ez visszaad 
        egy hibákat tartalmazó tömböt!!!!! 
    2. Hiba kezelés 
        Ha a checkData hibákat talál, azokat fel tudjuk dolgozni (pl. visszaküldhetjük a kliensnek a hibákat, hogy javítsa azokat) 
        A catch blokkba kerül majd bármilyen hiba kezelés pl. log-olás vagy hibaüzenet küldése!!! 
    *****

    Most az a kérdés, hogy milyen megoldást alkalmazzunk, tehát normál esetben, hogyha van egy hiba, akkor dobunk egy hibát 
    Viszont ha itt van hibánk és így dobunk egy hibát, hogy throw errors;
    ->
    async register(user) {
        try {
            const errors = this.checkData(user);

            throw errors;
        } catch(err) {

        }
    És akkor bekerülünk ennek a catch ágába és akkor még egy hibát dobunk, hogy elkapja ez a regisztráció (index.js app.post-os dolog)
    vagy akkor a catch ágban is return-öljünk vagy mi legyen
    -> 
    Innen a catch ágból valószinüleg érdemes továbbdobni a hibát és amikor az index.js-en a post-os regisztrációnál meghívjuk ezt a metódust 
    akkor az is majd egy try-catch blokkban lesz, de nem mindegy, hogy hogyan dobjuk tovább a hibánkat 

    Lehet azt csinálni, hogy a const errors = this.checkData(user); az nem a try-ban van, hanem felette kivül 
    és ott még kivül ha az errors-nak a length-je nagyobb, mint 0, tehát van hibánk, akkor visszaadunk egy objektumot a THROW-val 
    Ebben az objektumban lesz egy olyan kulcsunk, hogy status és az lesz az értéke, hogy 400 
    ->
    A 400-as hibakód ami annyit tesz, hogy bad request -> olyan kérést küldött a felhasználó, amely nem feldolgozató adatokat tartalmazott 
        tehát nem volt jó a jelszó vagy az email, amit beírt a felhasználó 
    És ugyanebben a tömben lesz egy message kulcs, aminek az értéke az errors (tehát az a tömb, amiben vannak a hibák)

        const errors = this.checkData(user);
        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
    és ezt majd az index.js-en el fogjuk kapni, egyébként meg a try blokkban meg csináljuk a response-ot query(INSERT INTO..)
    ->
        try {;
        const response = await conn.promise().query(
            `INSERT INTO users (userName, email, pass)
            VALUES(?,?,?)`
            [user.userName, user.email..]
        );

    De viszont itt jobb ha ezt ami egy tömbben van -> [user.userName, user.email..] ezt jobb hanem soroljuk itt fel így, mert lehet, hogy 
    van 65 darab 
    Hanem erre a megoldás, hogy Object.values(users);
    Mert itt már biztosan kell tudnunk azt ,hogy meg vannak az adatok, mert ha nem akkor itt dobnánk egy hibát 
    ->
        const errors = this.checkData(user);
        if(errors.length > 0) {
            throw {
                status: 400,
                message: errors
            }
        }

    A throw miatt véget érni a kód itteni futása és majd ezt el kéne itt kapnunk az index.js-ben az app.post-ban!!!! 

    Tehát itt simán mondhatjuk itt, hogy [Object.values(user)], mert ez ezt csinálja 
    egy példa 
    Object.values({userName: "sanyi", email: "sanyi@gmail.com"}) -> ["sanyi", "sanyi@gmail.com"]
        Kigyűjti egy tömbbe az objektum értékeit!! 
    Csak majd ezeknek -> `INSERT INTO users (userName, email, pass)
    ugyanolyan sorrendbe kell lennie, mint ahogy az adatokat majd a user-ben megkapjuk, mert ha nem akkor pl. 
    itt a userName az első (ahhoz lesz majd felvéve a táblába) és a req.body-ban meg nem az az első hanem az email 
    akkor az adatbázisba mondjuk ez fog bekerülni -> userName: "sanyi@gmail.com"

    De lehet, hogy ez így mégse fog menni, mert a pass-t azt majd hash-elni kell!!!!! 
            const response = await conn.promise().query(
                `INSERT INTO users (userName, email, pass)
                VALUES(?,?,?)`
                [user.userName, user.email, passHash(user.pass)]
            );

    Milyen eshetőségeink vannak itt 
    itt visszakapunk egy response-ban két tömbböt és az első tartalmazza majd az adatokat, a második meg, hogy milyen mezők vannak 
    de van még olyan az elsőben, hogy affectedRows, ezzel tudjuk, hogyha 1, akkor sikeresen fel lettek véve az adatok 
        tehát ha egyetlen egy új rekord születik (és ez biztos, hogy így lesz, mert egyszerre csak egy felhasználó tud regisztrálni)
    ->
    if(response[0].affectedRows === 1) {
        return {
            status: 201,
            message: "A regisztráció sikeres volt"
        }
    }
    Itt még nincsen email-es megerősítés, azt majd késöbb fogjuk venni!!! 
    de ha nem, tehát nem hozott létre új felhasználót (else ág), akkor viszont throw 
    és itt visszadobunk egy hibát, ugyanilyen objektumot és itt a status az egy szerver hiba kell, hogy legyen, mert úgye meg lettek adva 
    helyesen az adatok, de mégsem az response[0].affectedRows az egy!!!  
    503-as hibakód azt jelenti, hogy a szolgáltatás jelenleg nem elérhető
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
                    message: "A regisztráció sikeres volt"
                }
            } else {
                throw {
                    status: 503, 
                    message: "A regisztrációs szolgáltatás jelenleg nem érhető el"
                }
            }
    Viszont ha ebben a try-catch blokkban van egy hibánk, akkor jó ha tudnánk erről a hibáról 
    És itt van a nagyon fontos dolog, hogy amikor felépítünk egy müködőképes rendszert, akkor azt a hibát, ami ilyen szaknyelven van megfogalmazva
    azt nem küljük vissza a felhasználónak, de nekünk látnuk kell, hogy mi volt a hiba, de nem csak azt, hogy mi volt a hiba, hanem, hogy hol!!! 
    És ezt nem biztos, hogy jól megmondja nekünk a kód (interpreter, a frameworkünk)
    Ezért itt úgy kell csinálni, hogy a userHandler.register (belüli register) és itt dobtuk a hibát, hogy könnyen vissza tudjuk majd követni
    -> 
    } catch(err) {
        console.log("UserHandler.register: ", err);
    }
    és itt még továbbdobunk egy hibát a felhasználónak, hogy 503-as.. 
    -> 
    } catch(err) {
        console.log("UserHandler.register: ", err);
    throw {
        status: 503,
        message: "A regisztrációs szolgáltatás jelenleg nem elérhető!"
    }

    Valószinüleg, hogyha az affectedRows az nulla volt, akkor inkább a catch ágba fogunk bemenni, mert valami gond van a query-vel 
    vagy a szerverrel, nem érhető el az adatbázis szerver 
    atmegyünk az index.js-re és törlük mindent, csak a render-es rész, ami megmarad a post-os kérésből!!! 
*/