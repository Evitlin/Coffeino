// Add debounce function at the top
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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
                        <div class="empty-cart-content">
                        <img src="/cart/cart_images/shoping_bag.png" alt="Empty Cart" class="empty-cart-image">
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
                         <img src="/products/${item.productImage}" alt="${item.productName}" class="product-image" style="width: 100px; height: 100px;">
                        <div class="cart-item-details">
                            <h3>${item.productName}</h3>
                            <p>Price: ${item.productPrice}€</p>
                            <p>Total: <span class="item-total">${itemTotal.toFixed(2)}€</span></p>
                        </div>
                        <div class="cart-item-actions">
                            <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${doc.id}" data-productid="${item.productId}">
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
                    // Remove existing listeners by cloning
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);

                    newButton.addEventListener("click", async (event) => {
                        if (event.target.hasAttribute('processing')) return;
                        event.target.setAttribute('processing', 'true');
                        
                        try {
                            const productId = event.target.getAttribute("data-id");
                            const cartItemRef = db.collection("users").doc(user.uid).collection("cart").doc(productId);
                            const doc = await cartItemRef.get();
                            
                            if (doc.exists) {
                                const item = doc.data();
                                const productRef = db.collection("products").doc(item.productId);
                                
                                // Use batch to ensure atomic updates
                                const batch = db.batch();
                                
                                // First restore the stock
                                batch.update(productRef, {
                                    stock: firebase.firestore.FieldValue.increment(item.quantity)
                                });
                                
                                // Then remove from cart
                                batch.delete(cartItemRef);
                                
                                // Commit both operations
                                await batch.commit();
                                alert("Item removed from cart!");
                                location.reload();
                            }
                        } catch (error) {
                            console.error("Error removing item:", error);
                            alert("Error removing item. Please try again.");
                        } finally {
                            event.target.removeAttribute('processing');
                        }
                    });
                });

                // Add event listeners to quantity inputs
                document.querySelectorAll(".quantity-input").forEach(input => {
                    // Remove any existing event listeners by cloning
                    const newInput = input.cloneNode(true);
                    input.parentNode.replaceChild(newInput, input);

                    newInput.addEventListener("change", async (event) => {
                        if (event.target.hasAttribute('processing')) {
                            return;
                        }
                        event.target.setAttribute('processing', 'true');
                        
                        const productId = event.target.getAttribute("data-id");
                        const actualProductId = event.target.getAttribute("data-productid");
                        const newQuantity = parseInt(event.target.value);
                        
                        try {
                            const cartItemRef = db.collection("users").doc(user.uid).collection("cart").doc(productId);
                            const cartItemDoc = await cartItemRef.get();
                            
                            if (cartItemDoc.exists) {
                                const item = cartItemDoc.data();
                                const oldQuantity = item.quantity;
                                const quantityDiff = newQuantity - oldQuantity;
                                
                                if (newQuantity <= 0) {
                                    alert("Quantity must be greater than 0!");
                                    event.target.value = oldQuantity;
                                    event.target.removeAttribute('processing');
                                    return;
                                }

                                const productRef = db.collection("products").doc(actualProductId);
                                const productDoc = await productRef.get();

                                if (productDoc.exists) {
                                    const product = productDoc.data();
                                    const currentStock = product.stock;

                                    if (quantityDiff > currentStock) {
                                        alert("Not enough stock available!");
                                        event.target.value = oldQuantity;
                                        event.target.removeAttribute('processing');
                                        return;
                                    }

                                    const batch = db.batch();
                                    batch.update(productRef, {
                                        stock: firebase.firestore.FieldValue.increment(-quantityDiff)
                                    });
                                    batch.update(cartItemRef, {
                                        quantity: newQuantity
                                    });

                                    await batch.commit();
                                    alert("Quantity updated!");
                                    location.reload();
                                }
                            }
                        } catch (error) {
                            console.error("Error updating quantity:", error);
                            alert("Error updating quantity. Please try again.");
                            event.target.removeAttribute('processing');
                        }
                    });
                });

                // Handle checkout button
                if (checkoutButton) {
                    checkoutButton.addEventListener("click", () => {
                        db.collection("users").doc(user.uid).collection("cart").get()
                            .then(querySnapshot => {
                                const batch = db.batch();

                                querySnapshot.forEach(doc => {
                                    const cartItemRef = db.collection("users").doc(user.uid).collection("cart").doc(doc.id);
                                    batch.delete(cartItemRef);
                                });

                                return batch.commit();
                            })
                            .then(() => {
                                alert("Checkout successful!");
                                location.reload();
                            })
                            .catch(error => {
                                console.error("Error during checkout:", error);
                            });
                    });
                }
            })
            .catch(error => {
                console.error("Error fetching cart:", error);
            });
    } else {
        console.log("No user is logged in.");
        cartContainer.innerHTML = `
            <div class="empty-cart-content">
            <img src="/cart/cart_images/shoping_bag.png" alt="Empty Cart" class="empty-cart-image">
            <p class="empty-text">Login to see your cart</p>
            <a href="/products/product.html" id="shop_button">Go shopping</a>
            </div>
        `;
                cartSummary.style.display = "none";
        checkoutButton.style.display = "none";
    }
});