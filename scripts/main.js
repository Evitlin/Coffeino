document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

   // Absolute path to header.html and footer.html
    const headerPath = '/main_page/header.html';
    const footerPath = '/main_page/footer.html';


    // Loads header 
    fetch(headerPath)
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            initializeEventListeners();
            return loadFirebaseInit(); // Ensure Firebase is initialized first
        })
        .then(() => {
            console.log("Firebase initialized");
            loadProductLinksScript(); // Load product_links.js
            loadCartDropdown(); // Load empthy.js
        })
        .catch(error => console.error('Error loading header:', error));

    // Loads footer
    fetch(footerPath)
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
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

    // Absolute path to product_links.js 
    const srcPath = '/products/product_links.js';
    
    script.src = srcPath;
    script.onload = function() {
        console.log("product_links.js script loaded and executed");
    };
    script.onerror = function() {
        console.error("Error loading product_links.js script");
    };
    document.body.appendChild(script);
}

// Loads the cart dropdown script
function loadCartDropdown() {
    const script = document.createElement('script');

    const srcPath = '/scripts/empthy.js';
    
    script.src = srcPath;
    script.onload = function() {
        console.log("empthy.js script loaded and executed");
    };
    script.onerror = function() {
        console.error("Error loading empthy.js script");
    };
    document.body.appendChild(script);
}

function loadFirebaseInit() {
    return new Promise((resolve, reject) => {
        if (typeof firebase === "undefined" || !firebase.apps.length) {
            const firebaseAppScript = document.createElement('script');
            firebaseAppScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
            firebaseAppScript.onload = () => {
                const firebaseAuthScript = document.createElement('script');
                firebaseAuthScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
                firebaseAuthScript.onload = () => {
                    const firebaseFirestoreScript = document.createElement('script');
                    firebaseFirestoreScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
                    firebaseFirestoreScript.onload = () => {
                        const firebaseConfig = {
                            apiKey: "AIzaSyCgJ-IOeq76OCzmlUbGntMKmn550enir68",
                            authDomain: "coffeino-3157b.firebaseapp.com",
                            projectId: "coffeino-3157b",
                            storageBucket: "coffeino-3157b.appspot.com",
                            messagingSenderId: "739495575410",
                            appId: "1:739495575410:web:07e74233accd8d6443a7eb"
                        };
                        if (!firebase.apps.length) {
                            firebase.initializeApp(firebaseConfig);
                            window.db = firebase.firestore(); // Make Firestore globally accessible
                        }
                        resolve();
                    };
                    firebaseFirestoreScript.onerror = reject;
                    document.head.appendChild(firebaseFirestoreScript);
                };
                firebaseAuthScript.onerror = reject;
                document.head.appendChild(firebaseAuthScript);
            };
            firebaseAppScript.onerror = reject;
            document.head.appendChild(firebaseAppScript);
        } else {
            console.warn("Firebase is already initialized.");
            resolve();
        }
    });
}