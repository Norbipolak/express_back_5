import mysql2 from "mysql2";

const conn = mysql2.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "webshop"
});

export default conn;

/*
    Azzal kezdünk, hogy csinálunk egy conn.js-t, amibe beletesszük a createConnection-ös dolgot, amivel csatlakozunk az adatbázishoz 
    mert szebb, ha nem mindent a index.js-ben gyüjtünk össze
    de akkor a conn.js-be amibe beletettük, ott majd kell egy export default conn;
        de az fontos, hogy ott legyen beimportálva az import mysql2 from "mysql2" 
    és amikor behívjuk az index.js-be ott meg kell egy import conn from "./app/conn"
*/