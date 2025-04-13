firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("User is logged in:", user.uid);
    } else {
        console.log("No user is logged in.");
    }
});

firebase.auth().onAuthStateChanged(user => {
    const cartContainer = document.querySelector(".cart-item"); // Keep the existing div for the shopping bag
    const cartSummary = document.getElementById("cart-summary");
    const productCost = document.getElementById("product-cost");
    const packingFee = document.getElementById("packing-fee");
    const totalCost = document.getElementById("total-cost");
    const checkoutButton = document.getElementById("checkout-button");

    if (user) {
        console.log("User is logged in:", user.uid);
        // Proceed with fetching cart data
        cartContainer.innerHTML = `
            <p>Welcome, ${user.email}! Your cart is being loaded...</p>
        `;

        // Fetch cart from Firestore
        db.collection("users").doc(user.uid).collection("cart").get()
            .then(querySnapshot => {
                let total = 0;

                if (querySnapshot.empty) {
                    // Show empty cart message and keep the shopping bag image
                    cartContainer.innerHTML = `
                        <div class="form-content">
                        <img src="/cart/cart_images/shoping_bag.png" alt="Product Image" class="product-image">
                        <p class="empty-text">The cart is empty.</p>
                        <a href="/products/product.html" id="shop_button">Go shopping</a>
                        </div>
                    `;
                    cartSummary.style.display = "none";
                    checkoutButton.style.display = "none";
                    return;
                }

                // Clear the shopping bag image if the cart is not empty
                cartContainer.innerHTML = ""; 

                // Show cart items
                querySnapshot.forEach(doc => {
                    const item = doc.data();
                    const itemTotal = item.productPrice * item.quantity;
                    total += itemTotal;

                    const cartItem = document.createElement("div");
                    cartItem.classList.add("cart-item-row");
                    cartItem.innerHTML = `
                         <img src="${item.productImage}" alt="${item.productName}" class="product-image" style="width: 100px; height: 100px;">
                        <div class="cart-item-details">
                            <h3>${item.productName}</h3>
                            <p>Price: ${item.productPrice}€</p>
                            <p>Total: <span class="item-total">${itemTotal.toFixed(2)}€</span></p>
                        </div>
                        <div class="cart-item-actions">
                            <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${doc.id}" style="width: 50px;">
                            <button class="remove-item" data-id="${doc.id}">🗑️</button>
                        </div>
                    `;
                    cartContainer.appendChild(cartItem);
                });

                // Update cart summary
                
                const packingFeeValue = 0.50;
                const grandTotal = total + packingFeeValue;
                productCost.textContent = total.toFixed(2);
                packingFee.textContent = packingFeeValue.toFixed(2);
                totalCost.textContent = grandTotal.toFixed(2);

                cartSummary.style.display = "block";
                checkoutButton.style.display = "block";

                // Add event listeners to remove buttons
                document.querySelectorAll(".remove-item").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const productId = event.target.getAttribute("data-id");
                        db.collection("users").doc(user.uid).collection("cart").doc(productId).delete()
                            .then(() => {
                                alert("Item removed from cart!");
                                location.reload(); // Refresh the cart
                            })
                            .catch(error => {
                                console.error("Error removing item:", error);
                            });
                    });
                });

                // Add event listeners to quantity inputs
                document.querySelectorAll(".quantity-input").forEach(input => {
                    input.addEventListener("change", (event) => {
                        const productId = event.target.getAttribute("data-id");
                        const newQuantity = parseInt(event.target.value);
                        if (newQuantity > 0) {
                            db.collection("users").doc(user.uid).collection("cart").doc(productId).update({
                                quantity: newQuantity
                            }).then(() => {
                                alert("Quantity updated!");
                                location.reload(); // Refresh the cart
                            }).catch(error => {
                                console.error("Error updating quantity:", error);
                            });
                        } else {
                            alert("Invalid quantity!");
                        }
                    });
                });
            })
            .catch(error => {
                console.error("Error fetching cart:", error);
            });
    } else {
        console.log("No user is logged in.");
        cartContainer.innerHTML = `
            <div class="form-content">
            <img src="/cart/cart_images/shoping_bag.png" alt="Product Image" class="product-image">
            <p class="empty-text">Login to see your cart</p>
            <a href="/products/product.html" id="shop_button">Go shopping</a>
            </div>
        `;
        cartSummary.style.display = "none";
        checkoutButton.style.display = "none";
    }
});

// Handle checkout
document.getElementById("checkout-button").addEventListener("click", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection("users").doc(user.uid).collection("cart").get()
                .then(querySnapshot => {
                    const batch = db.batch(); // Use a batch to perform multiple updates

                    querySnapshot.forEach(doc => {
                        const item = doc.data();

                        // Deduct stock in the products collection
                        const productRef = db.collection("products").doc(item.productId);
                        batch.update(productRef, {
                            stock: firebase.firestore.FieldValue.increment(-item.quantity)
                        });

                        // Remove the item from the user's cart
                        const cartItemRef = db.collection("users").doc(user.uid).collection("cart").doc(doc.id);
                        batch.delete(cartItemRef);
                    });

                    // Commit the batch
                    return batch.commit();
                })
                .then(() => {
                    alert("Checkout successful!");
                    location.reload(); // Refresh the cart
                })
                .catch(error => {
                    console.error("Error during checkout:", error);
                });
        } else {
            alert("Please log in to checkout.");
        }
    });
});