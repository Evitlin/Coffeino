document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed");

   // Absolute path to header.html and footer.html
   const headerPath = '/admin/admin-header.html';

   loadFirebaseInit()
       .then(() => {
           console.log("Firebase initialized");
           return checkAdminAccess(); // Check if the user is an admin
       })
       .then(() => {
           // Load header
           return fetch(headerPath)
               .then(response => response.text())
               .then(data => {
                   document.getElementById('header-placeholder').innerHTML = data;
                   initializeEventListeners();
               });
       })
       .catch(error => {
           console.error("Error loading admin page:", error);
       });

});

function initializeEventListeners() {
    const header = document.querySelector("header");
    const menuBtn = document.querySelector("#menu-btn");
    const closeBtn = document.querySelector("#close-btn");
    const loginBtn = document.querySelector("#login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", (event) => {
            event.preventDefault();

            const confirmLogout = confirm("Are you sure you want to log out?");
            if (confirmLogout) {
                auth.signOut()
                    .then(() => {
                        alert("You have been logged out.");
                        window.location.href = "/login.html";
                    })
                    .catch((error) => {
                        console.error("Error during logout:", error);
                        alert("Failed to log out. Please try again.");
                    });
            }
        });
    }

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
}

function checkAdminAccess() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                alert("You must be logged in to access this page.");
                window.location.href = "/login.html";
                return reject("User not logged in.");
            }

            try {
                const userDoc = await db.collection("users").doc(user.uid).get();
                const userData = userDoc.data();

                if (userData && userData.role === "admin") {
                    console.log("Admin access granted.");
                    resolve();
                } else {
                    alert("You do not have permission to access this page.");
                    window.location.href = "/login.html";
                    reject("User is not an admin.");
                }
            } catch (error) {
                console.error("Error checking admin access:", error);
                alert("An error occurred. Please try again later.");
                window.location.href = "/login.html";
                reject(error);
            }
        });
    });
}
