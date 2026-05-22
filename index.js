const express = require("express");
const path = require("path");
const fs=require("fs");
const sass = require("sass");
const sharp = require("sharp");
const pg = require("pg");
app = express();
app.set("view engine", "ejs");

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"/resurse/scss"),
    folderCss:path.join(__dirname,"/resurse/css"),
    folderBackup:path.join(__dirname,"/backup")
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_foldere=[ "temp", "logs", "backup", "fisiere_uploadate" ]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(path.join(caleFolder), {recursive:true});   
    }
}

const client = new pg.Client({
    host: "localhost",
    user: "pavel",
    password: "Uzului16#",
    database: "trainmag",
    port: 5432
});
client.connect().then(function(){
    console.log("Conexiune baza de date realizata!");
    client.query("SELECT unnest(enum_range(null::categ_tren)) AS categorie", function(err, rezOptiuni) {
        if (!err) {
            // Salvăm opțiunile global. Ele vor fi văzute automat de header.ejs
            app.locals.optiuniMeniu = rezOptiuni.rows.map(rand => rand.categorie);
        }
    });
});

app.get(["/","/index","/home"], function(req, res) {
    let date = getDateGalerie(getAnotimp());
    
    let optiuniN = [3, 6, 9, 12, 15];
    let nrImaginiAnimata = optiuniN[Math.floor(Math.random() * optiuniN.length)];
    
    let totalImagini = obGlobal.obImagini.imagini.length;
    let maxOffset = totalImagini - nrImaginiAnimata;
    let offset = Math.floor(Math.random() * (maxOffset + 1));
    let imaginiAnimata = obGlobal.obImagini.imagini.slice(offset, offset + nrImaginiAnimata);
    
    let continutScss = `
$nr-imagini: ${nrImaginiAnimata};
@import "galerie_animata_baza";
`;
    let caleScssDinamic = path.join(obGlobal.folderScss, "galerie_animata_dinamic.scss");
    let caleCssDinamic = path.join(obGlobal.folderCss, "galerie_animata_dinamic.css");
    
    fs.writeFileSync(caleScssDinamic, continutScss);
    compileazaScss(caleScssDinamic, caleCssDinamic);

    res.render("pagini/index", {
        ip: req.ip,
        imagini: date.imagini,
        anotimp: date.anotimp,
        imaginiAnimata: imaginiAnimata 
    });
});

app.get("/galerie", function(req, res) {
    let date = getDateGalerie(getAnotimp());
    res.render("pagini/galerie", { 
        imagini: date.imagini, 
        anotimp: date.anotimp 
    });
});

app.use("/resurse",express.static(path.join(__dirname,"/resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"/resurse/imagini/ico/favicon.ico"))
});

// Rută pentru afișarea tuturor produselor (cu opțiune de filtrare)
app.get("/produse", function(req, res){
    let clauzaWhere = "";
    let parametri = [];
    
    // Dacă primim un filtru în URL (ex: ?categorie=machete_feroviare)
    if (req.query.categorie) {
        clauzaWhere = " WHERE categorie = $1";
        parametri.push(req.query.categorie);
    }
    
    // Folosim array-ul parametri pentru a trimite sigur datele către baza de date
    client.query(`SELECT * FROM produse${clauzaWhere}`, parametri, function(err, rez){
        if (err){
            console.log("Eroare preluare produse:", err);
            afisareEroare(res, 2); // Asigură-te că ai un identificator "2" în erori.json sau adaptează-l (ex: 500)
        }
        else {
            // Extragem dinamic opțiunile enumerației categ_tren
            client.query("SELECT * FROM unnest(enum_range(null::categ_tren))", function(err, rezOptiuni){
                if (err){
                    console.log("Eroare preluare enum:", err);
                    afisareEroare(res, 2);
                }
                else {
                    res.render("pagini/produse", {
                        produse: rez.rows,
                        optiuni: rezOptiuni.rows // Le poți folosi mai târziu în EJS pentru un meniu <select>
                    });
                }
            });
        }
    });
});


// Rută pentru afișarea unui produs individual
app.get("/produs/:id", function(req, res){
    // Folosim $1 pentru a proteja id-ul (evitare SQL Injection)
    client.query(`SELECT * FROM produse WHERE id = $1`, [req.params.id], function(err, rez){
        if (err){
            console.log("Eroare produs individual:", err);
            afisareEroare(res, 2);
        }
        else {
            // Verificăm dacă produsul există
            if (rez.rowCount == 0){
                afisareEroare(res, 404, "Produs inexistent", "Produsul cerut nu a putut fi găsit.");
            }
            else {
                // Trimitem datele produsului către pagină (folosim "produs" ca nume variabilă)
                res.render("pagini/produs", {
                    produs: rez.rows[0]
                });
            }
        }
    });
});

function verificareEroriInitiala() {
    let caleJson = path.join(__dirname, "/resurse/json/erori.json");

    if (!fs.existsSync(caleJson)) {
        console.error("EROARE FATALA: Fisierul erori.json nu exista! Aplicatia se inchide.");
        process.exit(); 
    }

    let textFisier = fs.readFileSync(caleJson).toString("utf-8");

    let blocuriObiecte = textFisier.match(/\{([^}]*)\}/g); 
    if (blocuriObiecte) {
        for (let i = 0; i < blocuriObiecte.length; i++) {
            let obiectText = blocuriObiecte[i];
            let frecventa = {
                '"identificator"': 0,
                '"status"': 0,
                '"titlu"': 0,
                '"text"': 0,
                '"imagine"': 0
            };

            for (let prop in frecventa) {
                frecventa[prop] = obiectText.split(prop).length - 1;

                if (frecventa[prop] > 1) {
                    console.error("EROARE: Proprietatea " + prop + " apare de " + frecventa[prop] + " ori in obiectul " + (i));
                }
            }
        }
    }
    let erori=JSON.parse(textFisier);

    if (!erori.info_erori || !erori.cale_baza || !erori.eroare_default) {
        console.error("EROARE: Lipseste una dintre proprietatile: info_erori, cale_baza sau eroare_default!");
    }

    if (erori.eroare_default) {
        let def = erori.eroare_default;
        if (!def.titlu || !def.text || !def.imagine) {
            console.error("EROARE: Pentru eroare_default lipseste titlul, textul sau imaginea!");
        }
    }

    let folderExista = false;
    if (erori.cale_baza) {
        
        let caleAbsolutaFolder = path.join(__dirname, erori.cale_baza);

        if (!fs.existsSync(caleAbsolutaFolder)) {
            console.error(`EROARE: Folderul specificat in cale_baza (${caleAbsolutaFolder}) nu exista!`);
        } else {
            folderExista = true;
        }

        if (folderExista) {
            if (erori.eroare_default?.imagine) {
                if (!fs.existsSync(path.join(caleAbsolutaFolder, erori.eroare_default.imagine))) {
                    console.error(`EROARE: Imaginea default (${erori.eroare_default.imagine}) lipseste!`);
                }
            }
            if (erori.info_erori) {
                for (let err of erori.info_erori) {
                    if (err.imagine && !fs.existsSync(path.join(caleAbsolutaFolder, err.imagine))) {
                        console.error(`EROARE: Imaginea (${err.imagine}) pt ID ${err.identificator} lipseste!`);
                    }
                }
            }
        }
    }

    if (erori.info_erori) {
        let aparitiiId = {};
        for (let err of erori.info_erori) {
                aparitiiId[err.identificator] = (aparitiiId[err.identificator] || 0) + 1;
        }
        for (let id in aparitiiId) {
            if (aparitiiId[id] > 1) {
                console.error(`EROARE BONUS: Identificatorul: ${id} apare de mai multe ori!`);
                for (let err of erori.info_erori) {
                    if (err.identificator == id) {
                        console.error(
                            "Status:", err.status, 
                            "| Titlu:", err.titlu, 
                            "| Text:", err.text, 
                            "| Imagine:", err.imagine
                        );
                    }
                }
            }
        }
    }
}

async function initImagini(){
    var continut = fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleGalerie = obGlobal.obImagini.cale_galerie;

    let caleAbs = path.join(__dirname, caleGalerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    let caleAbsMic = path.join(caleAbs, "mic");
    
    if (!fs.existsSync(caleAbsMediu)) fs.mkdirSync(caleAbsMediu, {recursive: true});
    if (!fs.existsSync(caleAbsMic)) fs.mkdirSync(caleAbsMic, {recursive: true});
    
    for (let imag of vImagini){
        let numeFisierOriginal = imag.cale_fisier; 
        let [numeFis, ext] = numeFisierOriginal.split(".");
        
        let caleFisAbs = path.join(caleAbs, numeFisierOriginal);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        let caleFisMicAbs = path.join(caleAbsMic, numeFis + ".webp");
        
        if (fs.existsSync(caleFisAbs)) {
            if (!fs.existsSync(caleFisMediuAbs)) await sharp(caleFisAbs).resize(350).toFile(caleFisMediuAbs);
            if (!fs.existsSync(caleFisMicAbs)) await sharp(caleFisAbs).resize(250).toFile(caleFisMicAbs);
        }
        
        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp").replace(/\\/g, "/");
        imag.fisier_mic = path.join("/", caleGalerie, "mic", numeFis + ".webp").replace(/\\/g, "/");
        imag.fisier = path.join("/", caleGalerie, numeFisierOriginal).replace(/\\/g, "/");
    }
}
initImagini();

function getAnotimp() {
    let luna = new Date().getMonth(); 
    if (luna === 11 || luna === 0 || luna === 1) return "iarna";
    if (luna >= 2 && luna <= 4) return "primavara";
    if (luna >= 5 && luna <= 7) return "vara";
    return "toamna";
}

function getDateGalerie(anotimpCurent) {
    let imaginiAfisate = obGlobal.obImagini.imagini
        .filter(img => img.anotimp === anotimpCurent)
        .slice(0, 10); 
    return { imagini: imaginiAfisate, anotimp: anotimpCurent };
}

function compileazaScss(caleScss, caleCss){
    if(!caleCss){
        let numeFisExt=path.basename(caleScss); 
        let numeFis=numeFisExt.split(".")[0]  
        caleCss=numeFis+".css"; 
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))
    }
    
    try {
        let rez = sass.compile(caleScss, { sourceMap: true });
        fs.writeFileSync(caleCss, rez.css);
    } catch (eroareCompilare) {
        console.error(`Eroare SASS la compilarea ${caleScss}:`, eroareCompilare.message);
    }
    
    if (fs.existsSync(caleCss)) {
        try {
            fs.copyFileSync(caleCss, path.join(caleBackup, numeFisCss));
        } catch (eroare) {
            console.error(`Eroare la copierea în backup a fișierului ${numeFisCss}:`, eroare.message);
        }
    }
}

vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

function initErori(){
    verificareEroriInitiala();
    let continut = fs.readFileSync(path.join(__dirname,"/resurse/json/erori.json")).toString("utf-8")
    let erori = JSON.parse(continut);
    obGlobal.obErori = erori;
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

function afisareEroare(res,identificator,titlu,text,imagine){
    let eroare=obGlobal.obErori.info_erori.find((elem)=>
        elem.identificator==identificator
    )
    let errDefault=obGlobal.obErori.eroare_default
    if(eroare?.status)
        res.status(eroare.identificator)
    res.render("pagini/eroare", {
        imagine:imagine||eroare?.imagine||errDefault.imagine, 
        titlu:titlu||eroare?.titlu||errDefault.titlu, 
        text:text||eroare?.text||errDefault.text});
}

app.get("/*pagina", function(req, res){
    console.log("Cale pagina", req.url);
    if (req.url.startsWith("/resurse") && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }
    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }
    try{
        res.render("pagini"+req.url, function(err, rezRandare){
            if (err){
                if (err.message.includes("Failed to lookup view")){
                    afisareEroare(res,404);
                }
                else{
                    afisareEroare(res);
                }
            }
            else{
                res.send(rezRandare);
            }
        });
    }
    catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404);
        }
        else{
            afisareEroare(res);
        }
    }
});

app.listen(8080);
console.log("Serverul a pornit pe portul 8080");