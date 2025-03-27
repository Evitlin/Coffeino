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