document.addEventListener("DOMContentLoaded", () => {
  const ordersList = document.getElementById("orders-list");
  const statusFilter = document.getElementById("status-filter");
  const sortOrder = document.getElementById("sort-order");
  const shippingModal = document.getElementById("shipping-modal");
  const shippingContent = document.getElementById("shipping-content");

  function formatDate(timestamp) {
      if (!timestamp) return "N/A";
      const date = new Date(timestamp);
      return date.toLocaleString();
  }

  function renderOrders(orders) {
      ordersList.innerHTML = "";

      orders.forEach(doc => {
          const order = doc.data();
          const orderHTML = `
              <div class="order-item">
                  <div class="order-header">
                      <div><strong>Order ID:</strong> ${doc.id}</div>
                      <div><strong>Date:</strong> ${formatDate(order.timestamp)}</div>
                  </div>
                  <div class="order-details">
                      <p><strong>Email:</strong> ${order.email || "N/A"}</p>
                      <p><strong>Items:</strong> ${order.items ? order.items.map(i => `${i.productName} (${i.quantity})`).join(", ") : "No items"}</p>
                      <p><strong>Payment Method:</strong> ${order.paymentMethod || "Unknown"}</p>
                      <p><strong>Delivery Method:</strong> ${order.delivery?.type || "N/A"}</p>
                      <p><strong>Total:</strong> ${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}€</p>
                      <p>
                          <strong>Status:</strong>
                          <select class="order-status-dropdown" data-id="${doc.id}">
                              <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                              <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
                              <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                          </select>
                          <button class="save-status-btn" data-id="${doc.id}">Save</button>
                      </p>
                      <p>
                          <button class="shipping-info-btn" data-id="${doc.id}">Generate Shipping Info</button>
                      </p>
                  </div>
              </div>
          `;
          ordersList.innerHTML += orderHTML;
      });

      document.querySelectorAll(".save-status-btn").forEach(button => {
          button.addEventListener("click", (event) => {
              const orderId = event.target.getAttribute("data-id");
              const dropdown = document.querySelector(`.order-status-dropdown[data-id="${orderId}"]`);
              const newStatus = dropdown.value;
              updateOrderStatus(orderId, newStatus);
          });
      });

      document.querySelectorAll(".shipping-info-btn").forEach(button => {
          button.addEventListener("click", (event) => {
              const orderId = event.target.getAttribute("data-id");
              showShippingInfo(orderId);
          });
      });
  }

  function updateOrderStatus(orderId, status) {
      db.collection("orders").doc(orderId).update({
          status: status
      }).then(() => {
          alert("Order status updated!");
      }).catch(error => {
          console.error("Error updating order status:", error);
          alert("Failed to update order status. Please try again.");
      });
  }

  function showShippingInfo(orderId) {
      db.collection("orders").doc(orderId).get().then(doc => {
          const order = doc.data();
          const deliveryType = order.delivery?.type || "N/A";
          const fullName = order.fullName || "Nenurodyta";
          const email = order.email || "N/A";
          const paymentMethod = order.paymentMethod || "Unknown";
          const paymentStatus = order.status || "Unknown";
          const orderDate = formatDate(order.timestamp);
          const items = order.items ? order.items.map(item => `<li>${item.productName} (x${item.quantity})</li>`).join('') : "<li>No items</li>";

          let shippingHTML = `
              <h2>Shipping Information</h2>
              <p><strong>Order ID:</strong> ${doc.id}</p>
              <p><strong>Customer Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Delivery Method:</strong> ${deliveryType}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Payment Status:</strong> ${paymentStatus}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              <p><strong>Items:</strong></p>
              <ul>${items}</ul>
          `;

          if (deliveryType === "parcel") {
              shippingHTML += `
                  <p><strong>City:</strong> ${order.delivery.city || "Nenurodyta"}</p>
                  <p><strong>Terminal:</strong> ${order.delivery.locker || "Nenurodyta"}</p>
                  <p><strong>Company:</strong> ${order.delivery.company || "Nenurodyta"}</p>
              `;
          } else if (deliveryType === "courier") {
              const address = order.delivery.address || {};
              shippingHTML += `
                  <p><strong>Address:</strong> ${order.delivery.address|| "Nenurodyta"}</p>
                  <p><strong>Phone:</strong> ${order.delivery.phone || "Telefono nr. nenurodytas"}</p>
              `;
          }

          shippingContent.innerHTML = shippingHTML;
          shippingModal.style.display = "flex";
      }).catch(error => {
          console.error("Error loading shipping info:", error);
          alert("Unable to load shipping info.");
      });
  }

  function applyFilters() {
      let query = db.collection("orders");

      if (statusFilter.value !== "All Orders") {
          query = query.where("status", "==", statusFilter.value);
      }

      query = query.orderBy("timestamp", sortOrder.value === "Oldest First" ? "asc" : "desc");

      return query;
  }

  // Initial load
  let unsubscribe = db.collection("orders")
      .orderBy("timestamp", "desc")
      .onSnapshot(snapshot => {
          if (snapshot.empty) {
              ordersList.innerHTML = "<p>No orders available.</p>";
              return;
          }
          renderOrders(snapshot.docs);
      }, error => {
          console.error("Error fetching orders:", error);
      });

  // Filter event listeners
  statusFilter.addEventListener("change", () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = applyFilters().onSnapshot(snapshot => {
          renderOrders(snapshot.docs);
      });
  });

  sortOrder.addEventListener("change", () => {
      if (unsubscribe) unsubscribe();
      unsubscribe = applyFilters().onSnapshot(snapshot => {
          renderOrders(snapshot.docs);
      });
  });
});
