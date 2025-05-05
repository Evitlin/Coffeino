window.addEventListener('firebase-ready', () => {
    if (typeof firebase === 'undefined') {
        console.error('Firebase is not defined.');
        return;
    }

    const db = firebase.firestore();
    const auth = firebase.auth();

    // Listen for authentication state changes
    auth.onAuthStateChanged(user => {
        if (!user) {
            console.error('User is not authenticated.');
            return;
        }

        console.log("User is logged in:", user.email);

        // Get the user ID (uid) after confirming the user is logged in
        const uid = user.uid;

        // Check if the orders-list element exists
        const ordersContainer = document.querySelector(".orders-list");
        const noOrdersMessage = document.querySelector(".no-orders-message");

        if (!ordersContainer) {
            console.error("orders-list element not found.");
            return;
        }

        // Fetch orders from Firestore (example)
        db.collection("orders")
          .where("userId", "==", uid) // Ensure the 'userId' field exists in your Firestore documents
          .get()
          .then(ordersSnapshot => {
            if (!ordersSnapshot.empty) {
              ordersSnapshot.forEach(doc => {
                const order = doc.data();
                const orderElement = document.createElement("div");
                orderElement.classList.add("order-item");

                orderElement.innerHTML = `
                  <h3>Order #${doc.id}</h3>
                  <p>Payment Method: ${order.paymentMethod}</p>
                  <p>Status: ${order.status}</p>
                  <p>Total: €${order.totalAmount.toFixed(2)}</p>
                  <p>Delivery: ${order.delivery.type}</p>
                  <div class="order-items">
                    <h4>Items:</h4>
                    <ul>
                      ${order.items.map(item => `<li>${item.productName} x${item.quantity}</li>`).join('')}
                    </ul>
                  </div>
                `;
                ordersContainer.appendChild(orderElement);
              });
              noOrdersMessage.style.display = 'none'; // Hide "No orders" message
            } else {
              noOrdersMessage.style.display = 'block'; // Show "No orders" message
            }
          })
          .catch(error => {
            console.error("Error fetching orders:", error.message || error);
            alert("There was an error fetching your orders.");
          });
    });
});
