document.addEventListener("DOMContentLoaded", () => {
    const ordersContainer = document.getElementById("orders-list");

    function loadOrders() {
        db.collection("orders").get().then((querySnapshot) => {
            ordersContainer.innerHTML = "";
            querySnapshot.forEach((doc) => {
                const order = doc.data();
                ordersContainer.innerHTML += `
                    <div class="order-card">
                        <h3>Order ID: ${doc.id}</h3>
                        <p>Status: ${order.status}</p>
                        <p>Total: ${order.totalAmount}€</p>
                        <button onclick="updateOrderStatus('${doc.id}', 'Shipped')">Mark as Shipped</button>
                    </div>
                `;
            });
        });
    }

    function updateOrderStatus(orderId, status) {
        db.collection("orders").doc(orderId).update({
            status: status
        }).then(() => {
            alert("Order status updated!");
            loadOrders();
        });
    }

    loadOrders();
});
// Initialize Firebase if not already done in another script
firebase.initializeApp({
    // your config here
  });
  const db = firebase.firestore();
  
  document.addEventListener("DOMContentLoaded", () => {
    const ordersList = document.getElementById("orders-list");
  
    function formatDate(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleString(); // format to 'YYYY-MM-DD HH:mm'
    }
  
    function renderOrders(orders) {
      ordersList.innerHTML = ""; // Clear existing
  
      orders.forEach(doc => {
        const order = doc.data();
        const orderHTML = `
          <div class="order-item">
            <div class="order-header">
              <div><a href="#">ORD ${doc.id}</a> - <span>${order.totalAmount.toFixed(2)}€</span></div>
              <div>${formatDate(order.timestamp)}</div>
            </div>
            <div class="order-details">
              <p><strong>${order.customerName || "Anonymous"}</strong><br>
              ${order.phone || "N/A"}<br>
              ${order.email || "N/A"}<br>
              ${order.address || "N/A"}</p>
  
              <p><strong>Payment Method:</strong> ${order.paymentMethod || "Unknown"}<br>
              <strong>Delivery Method:</strong> ${order.delivery?.type || "N/A"}</p>
  
              <p><strong>Status:</strong> <span class="order-status">${order.status || "pending"}</span></p>
  
              <p><strong>Items:</strong><br>${order.items.map(i => `${i.name} (${i.quantity})`).join(", ")}</p>
            </div>
          </div>
        `;
        ordersList.innerHTML += orderHTML;
      });
    }
  
    db.collection("orders")
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
        renderOrders(snapshot.docs);
      });
  });
  