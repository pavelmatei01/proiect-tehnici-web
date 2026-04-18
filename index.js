const express = require("express");
const path = require("path");
const fs=require("fs");
const sass = require("sass");
const sharp = require("sharp");
app = express();
app.set("view engine", "ejs");

obGlobal={
    obErori:null,
    obImagini:null,
    folderScss:path.join(__dirname,"resurse/css"),
    folderCss:path.join(__dirname,"resurse/css"),
    folderBackup:path.join(__dirname,"backup")
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

app.get(["/","/index","/home"], function(req, res) {
    res.render("pagini/index",{
        ip:req.ip
    });
});
// app.get("/service", function(req, res) {
//     res.render("pagini/service");
// });
app.use("/resurse",express.static(path.join(__dirname,"resurse")));

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname,"resurse/imagini/ico/favicon.ico"))
});

function verificareEroriInitiala() {
    let caleJson = path.join(__dirname, "resurse/json/erori.json");

    // Fisierul erori.json nu exista
    if (!fs.existsSync(caleJson)) {
        console.error("EROARE FATALA: Fisierul erori.json nu exista! Aplicatia se inchide.");
        process.exit(); 
    }

    let textFisier = fs.readFileSync(caleJson).toString("utf-8");

    //Verificare  duplicate
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

    // Lipsesc proprietatile principale
    if (!erori.info_erori || !erori.cale_baza || !erori.eroare_default) {
        console.error("EROARE: Lipseste una dintre proprietatile: info_erori, cale_baza sau eroare_default!");
    }

    // Lipsesc proprietatile din eroare_default
    if (erori.eroare_default) {
        let def = erori.eroare_default;
        if (!def.titlu || !def.text || !def.imagine) {
            console.error("EROARE: Pentru eroare_default lipseste titlul, textul sau imaginea!");
        }
    }

    //Verificare foldere si imagini
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

    //Identificatori duplicati 
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
function initErori(){
    verificareEroriInitiala();
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8")
    let erori=obGlobal.obErori=JSON.parse(continut)
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
// app.get("/eroare", function(req, res) {
//     afisareEroare(res,404)
// });

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
                // console.log("Rezultat randare", rezRandare);
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