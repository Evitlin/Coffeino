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
    const cartDropdownBody = document.getElementById("cart-dropdown-body");

    if (user) {
        // Fetch cart data from Firestore
        db.collection("users").doc(user.uid).collection("cart").get()
            .then(querySnapshot => {
                if (querySnapshot.empty) {
                    cartDropdownBody.innerHTML = `
                        <img src="/cart/cart_images/shoping_bag.jpg" class="mini-image" alt="Cart Icon">
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
                            <img src="${itemImage}" alt="${item.productName}" class="mini-image">
                            <div class="cart-item-details">
                                <p>${item.productName}</p>
                                <p>Quantity: ${item.quantity}</p>
                                <p>${itemTotal.toFixed(2)}€</p>
                            </div>
                        </div>
                    `;
                });

                cartDropdownBody.innerHTML += `
                    <div class="cart-total">
                        <strong>Total: ${total.toFixed(2)}€</strong>
                    </div>
                `;
            })
            .catch(error => {
                console.error("Error fetching cart data:", error);
            });
    } else {
        cartDropdownBody.innerHTML = `
            <img src="/cart/cart_images/shoping_bag.jpg" class="mini-image" alt="Cart Icon">
            <p class="empty-text">Please log in to view your cart.</p>
            <a href="/login.html" id="login-btn">Log In</a>
        `;
    }
});