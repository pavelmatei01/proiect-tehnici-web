
//daca exista o tema salvata in localStorage, atunci se adauga clasa "dark" la body pentru a aplica tema intunecata, altfel se elimina clasa "dark" pentru a reveni la tema luminoasa.
if (localStorage.getItem("tema")) {
    document.body.classList.add("dark");
} else {
    document.body.classList.remove("dark");
}