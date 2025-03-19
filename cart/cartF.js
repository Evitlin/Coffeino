document.addEventListener("DOMContentLoaded", function () {
    const cartBtn = document.getElementById("cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const closeBtn = document.getElementById("close-btn-modal");

    // Open cart modal when the cart button is clicked
    cartBtn.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default action for the <a> tag
        cartModal.classList.add("show");
        cartModal.classList.remove("hide");
    });

    // Close cart modal when the close button is clicked
    closeBtn.addEventListener("click", function () {
        cartModal.classList.add("hide");
        cartModal.classList.remove("show");
    });

    // Close the cart modal if the user clicks outside of it
    window.addEventListener("click", function (event) {
        if (event.target === cartModal) {
            cartModal.classList.add("hide");
            cartModal.classList.remove("show");
        }
    });
});
