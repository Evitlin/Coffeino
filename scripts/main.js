/*document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");
    // Load the header from header.html
    fetch('main_page/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initializeEventListeners();
            loadProductLinksScript();
        })
        .catch(error => console.error('Error loading header:', error));
});*/
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // Dynamically adjust the path based on the current page location
    let headerPath = window.location.pathname.includes('/products/') ? '../main_page/header.html' : 'main_page/header.html';

    fetch(headerPath)
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initializeEventListeners();
            loadProductLinksScript();
        })
        .catch(error => console.error('Error loading header:', error));
});

function initializeEventListeners() {
    
    const searchBtn = document.querySelector("#search-btn");
    const searchBox = document.querySelector("#search-box");
    const header = document.querySelector("header");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");

    // Toggle menu button
    if (menuBtn) {
        menuBtn.addEventListener("click", () => {
            header.classList.toggle("show-mobile-menu");
        });
    }

    // Close mobile menu
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            header.classList.remove("show-mobile-menu");
        });
    }

    document.getElementById("search-btn").addEventListener("click", function() {
        let searchBox = document.getElementById("search-box");
        searchBox.classList.toggle("active");
    });

}

// Load the product_links.js script after to ensure header and whatever else is loaded
// otherwise, the script may not find the elements it's looking for :'(
function loadProductLinksScript() {
    const script = document.createElement('script');
    script.src = 'products/product_links.js';
    script.onload = function() {
        console.log("product_links.js script loaded and executed");
    };
    script.onerror = function() {
        console.error("Error loading product_links.js script");
    };
    document.body.appendChild(script);
}