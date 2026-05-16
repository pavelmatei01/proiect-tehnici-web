window.addEventListener("DOMContentLoaded", function() {
    let chkTema = document.getElementById("schimba_tema");
    let iconTema = document.getElementById("icon_tema");

    // 1. Sincronizăm switch-ul cu tema salvată în localStorage
    if (document.body.classList.contains("dark")) {
        chkTema.checked = true;
        iconTema.classList.replace("fa-sun", "fa-moon");
    }

    // 2. Schimbare la acționarea switch-ului
    chkTema.onchange = function() {
        if (this.checked) {
            document.body.classList.add("dark");
            localStorage.setItem("tema", "dark");
            iconTema.classList.replace("fa-sun", "fa-moon");
        } else {
            document.body.classList.remove("dark");
            localStorage.removeItem("tema");
            iconTema.classList.replace("fa-moon", "fa-sun");
        }
    }
});