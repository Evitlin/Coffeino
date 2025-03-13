document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.querySelector("#search-btn");
    const searchBox = document.querySelector("#search-box");
    const header = document.querySelector("header");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");

    // Loads header from header.html
    fetch('main_page/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
    });
    //Toggle menu button
    menuBtn.addEventListener("click", ()=>{
        header.classList.toggle("show-mobile-menu");
    });
    //Close mobile menu
    closeBtn.addEventListener("click", ()=>{
        menuBtn.click();
    });
    document.getElementById("search-btn").addEventListener("click", function() {
        let searchBox = document.getElementById("search-box");
        searchBox.classList.toggle("active");
    });
});