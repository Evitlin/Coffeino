document.addEventListener('DOMContentLoaded', function () {
    // Wait for Firebase to be ready
    if (typeof auth === "undefined") {
        window.addEventListener('firebase-ready', initializeProfilePage);
    } else {
        initializeProfilePage();
    }
});

function initializeProfilePage() {
    // Check if the user is authenticated
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        // Proceed with loading the profile page if the user is logged in
        const links = document.querySelectorAll('.rectangle-B a');
        const contentPlaceholder = document.getElementById('content-placeholder');
        const logoutLink = document.getElementById('logout-link');
        let currentPage = 'profile';

        links.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const page = this.getAttribute('data-page'); // Get the page from data-page attribute

                fetch(`/account/pages/${page}.html`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(data => {
                        contentPlaceholder.innerHTML = data;
                        currentPage = page;
                    })
                    .catch(error => {
                        contentPlaceholder.innerHTML = `<h2>Error Loading Page</h2><p>${error.message}</p>`;
                        console.error('Error loading page:', error);
                    });
            });
        });

        logoutLink.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent default link behavior
            const confirmLogout = confirm('Are you sure you want to log out?'); // Show confirmation dialog
            if (confirmLogout) {
                auth.signOut() // Firebase sign-out
                .then(() => {
                    alert('You have been logged out.');
                    window.location.href = '/login.html'; // Redirect to login page
                })
                .catch(error => {
                    console.error('Error during logout:', error);
                    alert('Failed to log out. Please try again.');
                });
            }
        });

        // Loads the default page
        fetch(`/account/pages/profile.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                contentPlaceholder.innerHTML = data;
            })
            .catch(error => {
                contentPlaceholder.innerHTML = `<h2>Error Loading Default Page</h2><p>${error.message}</p>`;
                console.error('Error loading default page:', error);
            });
    });
}