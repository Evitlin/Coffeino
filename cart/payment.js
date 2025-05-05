let selectedPaymentMethod = null;
async function submitOrder(event) {
    event.preventDefault();

    const deliveryMethod = document.querySelector('input[name="delivery"]:checked');
    if (!deliveryMethod) return alert("Select a delivery method.");

    if (!selectedPaymentMethod) {
        alert("Please select a payment method.");
        return;
    }

    // Define orderData here
    let orderData = {};
    orderData.paymentMethod = selectedPaymentMethod;

    let deliveryInfo = {};
    if (deliveryMethod.id === "courier") {
        const address = document.getElementById("address").value.trim();
        const phone = document.getElementById("phone").value.trim();
        if (!address || !phone) return alert("Fill in address and phone number.");
        deliveryInfo = { type: "courier", address, phone };
    } else if (deliveryMethod.id === "parcel") {
        const selects = document.querySelectorAll("#lockerSelect select");
        const city = selects[0].value.trim();
        const locker = selects[1].value.trim();
    
        const selectedCompanyButton = document.querySelector('#lockerCompanies .selected');
        const company = selectedCompanyButton ? selectedCompanyButton.getAttribute("data-company") : "";
    
        if (!company || city === "City" || locker === "Select parcel locker") {
            return alert("Please fill in all parcel locker information.");
        }
    
        deliveryInfo = { type: "parcel", company, locker, city };
    }

    firebase.auth().onAuthStateChanged(async user => {
        if (!user) {
            alert("You must be logged in to place an order.");
            return;
        }

        try {
            const cartSnapshot = await db.collection("users").doc(user.uid).collection("cart").get();
            if (cartSnapshot.empty) return alert("Your cart is empty.");

            const batch = db.batch();
            const orderItems = [];
            let total = 0;

            cartSnapshot.forEach(doc => {
                const item = doc.data();
                orderItems.push(item);
                total += item.productPrice * item.quantity;

                const productRef = db.collection("products").doc(item.productId);
                batch.update(productRef, {
                    stock: firebase.firestore.FieldValue.increment(-item.quantity)
                });

                const cartRef = db.collection("users").doc(user.uid).collection("cart").doc(doc.id);
                batch.delete(cartRef);
            });

            orderData = {
                userId: user.uid,
                email: user.email,
                items: orderItems,
                delivery: deliveryInfo,
                paymentMethod: selectedPaymentMethod,  // Fixed here
                totalAmount: total + 0.50,
                status: "Awaiting Payment",
                timestamp: Date.now()
            };

            await db.collection("orders").add(orderData);
            await batch.commit();

            alert("Order placed successfully!");
            window.location.href = "/cart.html"; // Redirect to cart page or any other page
        } catch (err) {
            console.error("Error placing order:", err);
            alert("Failed to place order.");
        }
    });
}
const paymentButtons = document.querySelectorAll(".payment-logos button");

paymentButtons.forEach(button => {
  button.addEventListener("click", () => {
    paymentButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");

    // Make sure you set selectedPaymentMethod correctly
    selectedPaymentMethod = button.querySelector("img").alt;
    console.log("Selected payment method:", selectedPaymentMethod);
  });
});/*
const phonePattern = /^[0-9]{10}$/; // Example phone pattern (modify as needed)
if (!address || !phone || !phonePattern.test(phone)) {
    return alert("Fill in address and a valid phone number.");
}*/