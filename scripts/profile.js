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

        const links = document.querySelectorAll('.rectangle-B a');
        const contentPlaceholder = document.getElementById('content-placeholder');
        const logoutLink = document.getElementById('logout-link');
        let currentPage = 'profile';

        links.forEach(link => {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                const page = this.getAttribute('data-page'); // Get the page from the data-page attribute

                // Dynamically fetch page content
                fetch(`/account/pages/${page}.html`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(data => {
                        contentPlaceholder.innerHTML = data; // Update content
                        currentPage = page;

                        // Call orders fetching function if it's the orders page
                        if (currentPage === "orders") {
                            loadOrders(user.uid); // Load orders for the logged-in user
                        }
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
                auth.signOut()
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

        // Load the default page if needed
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
                contentPlaceholder.innerHTML = `<h2>Error Loading Default Page</h2><p>${error.message}</p>`;
                console.error('Error loading default page:', error);
            });
    });
}

function loadOrders(uid) {
    const ordersContainer = document.querySelector(".orders-list");
    const noOrdersMessage = document.querySelector(".no-orders-message");
    const basePath = "/products/";

    // Fetch orders from Firebase Firestore
    db.collection("orders")
        .where("userId", "==", uid)
        .get()
        .then(ordersSnapshot => {
            if (!ordersSnapshot.empty) {
                ordersSnapshot.forEach(doc => {
                    const order = doc.data();
                    const orderElement = document.createElement("div");
                    orderElement.classList.add("order-item");
                    const orderDate = new Date(order.timestamp).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    });

                    orderElement.innerHTML = `
                        <h3>Order ID: ${doc.id}</h3>
                        <p><strong>Date:</strong> ${orderDate}</p>
                        <p>Status: <span class="order-status">${order.status}</span></p>
                        <p>Payment Method: ${order.paymentMethod}</p>
                        <p>Total: €${order.totalAmount.toFixed(2)}</p>
                        <p>Delivery: ${order.delivery.type}</p>
                        <div class="order-items">
                            <h4>Items:</h4>
                            <ul>
                                ${order.items.map(item => `
                                    <li class="order-item-details">
                                        <img src="${basePath}${item.productImage}" alt="${item.productName}" class="product-image">
                                        <div class="product-info">
                                            <p><strong>${item.productName}</strong></p>
                                            <p>${item.quantity} x €${item.productPrice.toFixed(2)}</p>
                                        </div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    `;
                    ordersContainer.appendChild(orderElement);
                });
                noOrdersMessage.style.display = 'none'; // Hide the "No orders" message
            } else {
                noOrdersMessage.style.display = 'block'; // Show "No orders" message
            }
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
            alert("There was an error fetching your orders.");
        });
}


