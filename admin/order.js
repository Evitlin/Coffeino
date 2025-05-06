document.addEventListener("DOMContentLoaded", () => {
    const ordersList = document.getElementById("orders-list");
    console.log("Orders list element:", ordersList); // Debug

    function formatDate(timestamp) {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    function renderOrders(orders) {
        console.log("Rendering orders:", orders.length); // Debug
        ordersList.innerHTML = "";

        orders.forEach(doc => {
            const order = doc.data();
            console.log("Processing order:", doc.id, order); // Debug

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
                    </div>
                </div>
            `;
            ordersList.innerHTML += orderHTML;
        });

        // Add event listeners to save buttons
        document.querySelectorAll(".save-status-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                const orderId = event.target.getAttribute("data-id");
                const dropdown = document.querySelector(`.order-status-dropdown[data-id="${orderId}"]`);
                const newStatus = dropdown.value;
                updateOrderStatus(orderId, newStatus);
            });
        });
    }

    function updateOrderStatus(orderId, status) {
        console.log(`Updating status for order ${orderId} to ${status}`); // Debug
        db.collection("orders").doc(orderId).update({
            status: status
        }).then(() => {
            alert("Order status updated!");
        }).catch(error => {
            console.error("Error updating order status:", error);
            alert("Failed to update order status. Please try again.");
        });
    }

    // Initial load and real-time updates
    let unsubscribe = db.collection("orders")
        .orderBy("timestamp", "desc")
        .onSnapshot(snapshot => {
            console.log("Snapshot received:", snapshot.size, "orders"); // Debug
            if (snapshot.empty) {
                console.log("No orders found.");
                ordersList.innerHTML = "<p>No orders available.</p>";
                return;
            }
            renderOrders(snapshot.docs);
        }, error => {
            console.error("Error fetching orders:", error);
        });

    // Listen for filter changes
    const statusFilter = document.getElementById("status-filter");
    const sortOrder = document.getElementById("sort-order");

    function applyFilters() {
        let query = db.collection("orders");

        // Apply status filter
        if (statusFilter.value !== "All Orders") {
            query = query.where("status", "==", statusFilter.value);
        }

        // Apply sort order
        query = query.orderBy("timestamp", sortOrder.value === "Oldest First" ? "asc" : "desc");

        return query;
    }

    // Update when filters change
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
