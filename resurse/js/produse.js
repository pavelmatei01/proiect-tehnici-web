window.onload = function() {
    // Salvăm ordinea inițială
    let grid = document.querySelector(".grid-produse");
    let articoleInitiale = Array.from(document.getElementsByClassName("produs"));

    // Actualizare range
    document.getElementById("inp-scara").onchange = function() {
        document.getElementById("infoRange").innerHTML = `(${this.value})`;
    }

    // Funcție validare simplă (An 2 CTI)
    function valideaza() {
        let n = document.getElementById("inp-nume").value.trim();
        let d = document.getElementById("inp-descriere").value.trim();
        if ((n !== "" && !/^[a-zA-Z0-9 ]*$/.test(n)) || (d !== "" && d.length < 3)) {
            alert("Input invalid!");
            return false;
        }
        return true;
    }

    // Filtrare
    document.getElementById("filtrare").onclick = function() {
        if (!valideaza()) return;

        let vNume = document.getElementById("inp-nume").value.trim().toLowerCase();
        let vScara = parseInt(document.getElementById("inp-scara").value);
        let vCat = document.getElementById("inp-categorie").value.toLowerCase();
        
        let vDig = "toate";
        for (let r of document.getElementsByName("gr_digital")) {
            if (r.checked) vDig = r.value;
        }

        let prods = document.getElementsByClassName("produs");
        for (let p of prods) {
            p.style.display = "none";
            
            let nume = p.querySelector(".val-nume").innerHTML.trim().toLowerCase();
            let scara = parseInt(p.querySelector(".val-scara").innerHTML.trim());
            let cat = p.querySelector(".val-categorie").innerHTML.trim().toLowerCase();
            let dig = p.querySelector(".val-digital").innerHTML.trim().toLowerCase();

            let cond1 = nume.includes(vNume);
            let cond2 = scara > vScara;
            let cond3 = (vCat === "toate" || cat === vCat);
            let cond4 = (vDig === "toate" || dig === vDig);

            if (cond1 && cond2 && cond3 && cond4) p.style.display = "block";
        }
    }

    // Sortare (Cheie: Scara/Pret + Subcategorie)
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

    document.getElementById("sortCrescNume").onclick = () => sorteaza(1);
    document.getElementById("sortDescrescNume").onclick = () => sorteaza(-1);

    // Resetare (Confirm + Reordonare)
    document.getElementById("resetare").onclick = function() {
        if (confirm("Resetați?")) {
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-scara").value = 0;
            document.getElementById("infoRange").innerHTML = "(0)";
            document.getElementById("rad-digital-toate").checked = true;
            for (let a of articoleInitiale) {
                grid.appendChild(a);
                a.style.display = "block";
            }
        }
    }

    // Suma (Alt+C)
    window.onkeydown = function(e) {
        if (e.key === "c" && e.altKey) {
            let s = 0;
            for (let p of document.getElementsByClassName("produs")) {
                if (p.style.display !== "none") s += parseFloat(p.querySelector(".val-pret").innerHTML);
            }
            let info = document.createElement("p");
            info.id = "infoSuma";
            info.innerHTML = `Suma: ${s.toFixed(2)} Lei`;
            grid.parentElement.insertBefore(info, grid);
            setTimeout(() => info.remove(), 2000);
        }
    }
}