window.onload = function() {
    let grid = document.querySelector(".grid-produse");
    let articoleInitiale = Array.from(document.getElementsByClassName("produs"));
    document.getElementById("inp-scara").oninput = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    };

    let inpDescriere = document.getElementById("inp-descriere");
    //se pun clasele bootstrap "is-valid" sau "is-invalid" in functie de lungimea textului introdus in campul de descriere, pentru a oferi feedback vizual utilizatorului despre validitatea descrierii
    inpDescriere.oninput = function() {
        let text = this.value.trim();
        if (text.length > 0 && text.length < 3) {
            this.classList.add("is-invalid");
            this.classList.remove("is-valid");
        } else if (text.length >= 3) {
            this.classList.add("is-valid");
            this.classList.remove("is-invalid");
        } else {
            this.classList.remove("is-valid", "is-invalid");
        }
    };

    function valideaza() {
        let n = document.getElementById("inp-nume").value.trim();
        let d = inpDescriere.value.trim();
        let eValid = true;

        if (n !== "" && !/^[a-zA-ZăâîșțĂÂÎȘȚ0-9 \-]+$/.test(n)) {
            alert("Nume invalid! Doar litere, cifre și cratime.");
            eValid = false;
        }

        if (d !== "" && d.length < 3) {
            inpDescriere.classList.add("is-invalid");
            alert("Descrierea introdusă este prea scurtă (minim 3 caractere).");
            eValid = false;
        }

        return eValid;
    }

    document.getElementById("filtrare").onclick = function() {
        if (!valideaza()) return;

        let vNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        let vScara = parseInt(document.getElementById("inp-scara").value);
        let vCat = document.getElementById("inp-categorie").value.toLowerCase();
        let vDesc = inpDescriere.value.trim().toLowerCase();
        let vEra = document.getElementById("inp-era").value.trim().toLowerCase();

        let vDig = "toate";
        for (let r of document.getElementsByName("gr_digital")) {
            if (r.checked) vDig = r.value;
        }

        let subcategoriiBifate = [];
        for (let c of document.getElementsByClassName("inp-subcateg")) {
            if (c.checked) subcategoriiBifate.push(c.value.toLowerCase());
        }

        let materialeSelectate = Array.from(document.getElementById("inp-materiale").selectedOptions)
            .map(o => o.value.toLowerCase());

        let prods = document.getElementsByClassName("produs");
        for (let p of prods) {
            p.style.display = "none";

            let nume = p.querySelector(".val-nume").innerHTML.trim().toLowerCase();
            let scara = parseInt(p.querySelector(".val-scara").innerHTML.trim());
            let cat = p.querySelector(".val-categorie").innerHTML.trim().toLowerCase();
            let dig = p.querySelector(".val-digital").innerHTML.trim().toLowerCase();
            let descriere = p.querySelector(".val-descriere").innerHTML.trim().toLowerCase();
            let subcat = p.querySelector(".val-subcategorie").innerHTML.trim().toLowerCase();
            let era = p.querySelector(".val-era").innerHTML.trim().toLowerCase();
            let materiale = p.querySelector(".val-materiale") ? p.querySelector(".val-materiale").innerHTML.trim().toLowerCase() : "";
            //conditia 1, daca numele produsului include textul introdus in campul de nume (ignorand majuscule/minuscule)
            //conditia 2, daca scara produsului este mai mare decat valoarea introdusa in campul de scara
            //conditia 3, daca categoria produsului este egala cu cea selectata in campul de categorie sau daca in campul de categorie este selectata optiunea "toate"
            //conditia 4, daca produsul este digital sau nu, in functie de optiunea selectata in campul de digital/analog
            //conditia 5, daca descrierea produsului include textul introdus in campul de descriere (ignorand majuscule/minuscule) sau daca campul de descriere este gol
            //conditia 6, daca subcategoria produsului este bifata in lista de subcategorii sau daca niciuna nu este bifata (adica se accepta toate subcategoriile)
            //conditia 6_era, daca era produsului este egala cu cea introdusa in campul de era sau daca campul de era este gol
            //conditia 7, daca materialele produsului includ macar unul dintre materialele selectate in campul de materiale sau daca niciun material nu este selectat (adica se accepta toate materialele)
            let cond1 = nume.includes(vNume);
            let cond2 = scara > vScara;
            let cond3 = (vCat === "toate" || cat === vCat);
            let cond4 = (vDig === "toate" || dig === vDig);
            let cond5 = (vDesc === "" || descriere.includes(vDesc));
            let cond6_era = (vEra === "" || era === vEra);

            let cond6 = subcategoriiBifate.includes(subcat);

            let cond7 = materialeSelectate.length === 0 ||
                materialeSelectate.some(m => materiale.includes(m));

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond6_era && cond7) {
                p.style.display = "block";
            }
        }
    };

    function sorteaza(semn) {
        let vProds = Array.from(document.getElementsByClassName("produs"));
        vProds.sort(function(a, b) {
            let rA = parseInt(a.querySelector(".val-scara").innerHTML) / parseFloat(a.querySelector(".val-pret").innerHTML);
            let rB = parseInt(b.querySelector(".val-scara").innerHTML) / parseFloat(b.querySelector(".val-pret").innerHTML);

            if (Math.abs(rA - rB) < 0.001) {
                let sA = a.querySelector(".val-subcategorie").innerHTML;
                let sB = b.querySelector(".val-subcategorie").innerHTML;
                return semn * sA.localeCompare(sB);
            }
            return semn * (rA - rB);
        });
        for (let p of vProds) grid.appendChild(p);
    }

    document.getElementById("sortCrescNume").onclick = function() {
        if (valideaza()) sorteaza(1);
    };
    document.getElementById("sortDescrescNume").onclick = function() {
        if (valideaza()) sorteaza(-1);
    };

    document.getElementById("calculare").onclick = function() {
        if (!valideaza()) return;
        let s = 0;
        for (let p of document.getElementsByClassName("produs")) {
            if (p.style.display !== "none") {
                s += parseFloat(p.querySelector(".val-pret").innerHTML);
            }
        }
        let info = document.createElement("div");
        info.className = "info-suma";
        info.innerHTML = `Suma produselor afișate: <strong>${s.toFixed(2)} Lei</strong>`;
        document.body.appendChild(info);
        setTimeout(() => info.remove(), 2000);
    };

    document.getElementById("resetare").onclick = function() {
        if (confirm("Resetați filtrele?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-scara").value = 0;
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("rad-toate").checked = true;
            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-era").value = "";

            let selMat = document.getElementById("inp-materiale");
            for (let opt of selMat.options) opt.selected = false;

            inpDescriere.value = "";
            inpDescriere.classList.remove("is-valid", "is-invalid");

            let checks = document.getElementsByClassName("inp-subcateg");
            for (let c of checks) c.checked = true;

            for (let a of articoleInitiale) {
                grid.appendChild(a);
                a.style.display = "block";
            }
        }
    };
};
