document.addEventListener('DOMContentLoaded', function () {
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

            // ! Insert logout logic here !
            // (Firebase auth sign out)
            window.location.href = '/account/pages/logout.html'; // temp

        } else {
            fetch(`/account/pages/${currentPage}.html`)
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
                    contentPlaceholder.innerHTML = `<h2>Error Reloading Page</h2><p>${error.message}</p>`;
                    console.error('Error reloading page:', error);
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