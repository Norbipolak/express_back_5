import { createHash } from "crypto";

function passHash(pass) {
    return createHash("sha512").update(pass.trim()).digest("hex");
}

export default passHash;

/*
    return createHash("sha512").update(req.body.pass).digest("hex");
    És a req.body.pass helyett, ami itt nyilván nincsen meg 
    ezért vár a függvény egy pass-t -> function passHash(pass) {..
    És itt fogja megkapni a pass-t paramétert, amit várunk 
    ->
    return createHash("sha512").update(pass.trim()).digest("hex");
    És akkor ezt majd az index.js-en fel is tudjuk használni és ott megadjuk neki a req.body.pass-t, ami ott elérhető
    -> 
    ott meg meghívjuk az index-en 
    const passHash = passHash(req.body.pass);

    Ami nagyon fontos, hogy be kell hívni, importálni 
    -> 
    import { createHash } from "crypto";
*/
