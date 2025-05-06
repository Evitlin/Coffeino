const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const closeBtn = document.getElementById("close-btn");

const cartButtons = document.querySelectorAll("#cart-btn, #header-cart-btn");

document.getElementById('cart-btn').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default link behavior if needed
    const dropdown = document.querySelector('.cart-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Optional: Close the dropdown when clicking outside of it
document.addEventListener('click', function (event) {
    const cartContainer = document.querySelector('.cart-container');
    const dropdown = document.querySelector('.cart-dropdown');
    if (!cartContainer.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

firebase.auth().onAuthStateChanged(user => {
    // Only initialize dropdown cart if we're not on the main cart page
    if (window.location.pathname === '/cart.html') {
        return;
    }

    const cartDropdownBody = document.getElementById("cart-dropdown-body");

    if (user) {
        // Fetch cart data from Firestore
        db.collection("users").doc(user.uid).collection("cart").get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    cartDropdownBody.innerHTML = `
                        <img src="/cart/cart_images/shoping_bag.png" class="mini-image" alt="Cart Icon">
                        <p class="empty-text">The cart is empty.</p>
                        <a href="/products/product.html" id="go-shopping-btn">Shop Now</a>                  
                    `;
                    return;
                }

                cartDropdownBody.innerHTML = `
                    <h3>Your shopping cart:</h3>
                `;
                let total = 0;

                querySnapshot.forEach(doc => {
                    const item = doc.data();
                    console.log("Product Image:", item.productImage); // Debugging

                    // Check if productImage already contains a path
                    const itemImage = item.productImage && item.productImage.includes('/')
                        ? item.productImage // Use the full path if it exists
                        : `/products/${item.productImage || 'default.jpg'}`; // Prepend path or use fallback

                    const itemTotal = item.productPrice * item.quantity;
                    total += itemTotal;

                    cartDropdownBody.innerHTML += `
                        <div class="cart-item">
                            <img src="/products/${itemImage}" alt="${item.productName}" class="mini-image">
                            <div class="cart-item-details">
                                <p>${item.productName}</p>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" data-id="${doc.id}" data-productid="${item.productId}">
                                <p>${itemTotal.toFixed(2)}€</p>
                                <button class="remove-item" data-id="${doc.id}">🗑️</button>
                            </div>
                        </div>
                    `;
                });

                cartDropdownBody.innerHTML += `
                    <div class="cart-total">
                        <strong>Total: ${total.toFixed(2)}€</strong>
                    </div>
                `;

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
                    
                    newInput.addEventListener("change", (event) => {
                        if (event.target.hasAttribute('processing')) {
                            return;
                        }
                        event.target.setAttribute('processing', 'true');
                        
                        const productId = event.target.getAttribute("data-id");
                        const actualProductId = event.target.getAttribute("data-productid");
                        const newQuantity = parseInt(event.target.value);
                        const cartItemRef = db.collection("users").doc(user.uid).collection("cart").doc(productId);
                        
                        if (newQuantity > 0) {
                            cartItemRef.get().then(doc => {
                                if (doc.exists) {
                                    const item = doc.data();
                                    const oldQuantity = item.quantity;
                                    const quantityDiff = newQuantity - oldQuantity;
                                    const productRef = db.collection("products").doc(actualProductId);
                                    
                                    // Check if we have enough stock
                                    return productRef.get().then(productDoc => {
                                        if (productDoc.exists) {
                                            const product = productDoc.data();
                                            const currentStock = product.stock;
                                            
                                            if (quantityDiff > currentStock) {
                                                alert("Not enough stock available!");
                                                event.target.value = oldQuantity; // Reset to old quantity
                                                event.target.removeAttribute('processing');
                                                return;
                                            }
                                            
                                            // Use batch to ensure atomic update
                                            const batch = db.batch();
                                            
                                            // Update product stock
                                            batch.update(productRef, {
                                                stock: firebase.firestore.FieldValue.increment(-quantityDiff)
                                            });
                                            
                                            // Update cart quantity
                                            batch.update(cartItemRef, {
                                                quantity: newQuantity
                                            });
                                            
                                            return batch.commit();
                                        }
                                    }).then(() => {
                                        alert("Quantity updated!");
                                        location.reload();
                                    });
                                }
                            }).catch(error => {
                                console.error("Error updating quantity:", error);
                                alert("Error updating quantity. Please try again.");
                            }).finally(() => {
                                event.target.removeAttribute('processing');
                            });
                        } else {
                            alert("Quantity must be greater than 0!");
                            event.target.value = 1; // Reset to 1 if invalid
                            event.target.removeAttribute('processing');
                        }
                    });
                });

            })
            .catch(error => {
                console.error("Error fetching cart data:", error);
            });
    } else {
        cartDropdownBody.innerHTML = `
            <img src="/cart/cart_images/shoping_bag.png" class="mini-image" alt="Cart Icon">
            <p class="empty-text">Login to see your cart</p>
            <a href="/products/product.html" id="go-shopping-btn">Shop Now</a>
        `;
            }
});