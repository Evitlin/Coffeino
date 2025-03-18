document.addEventListener("DOMContentLoaded", function(){
    const cartBtn = document.getElementById("cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const closeBtn = document.getElementById("close-btn");

    const cartButtons = document.querySelectorAll("#cart-btn, #header-cart-btn");

    cartBtn.addEventListener("click", function (event) {
        event.preventDefault(); 
        cartModal.style.display = "block";
    });

    
    closeBtn.addEventListener("click", function () {
        cartModal.style.display = "none";
        //cartModal.classList.remove("show");
    });

    window.addEventListener("click", function (event) {
        if (event.target === cartModal) {
            cartModal.style.display = "none";
            //cartModal.classList.remove("show");
        }
    });

   
    document.getElementById("go-shopping-btn").addEventListener("click", function () {
        
        window.location.href = "product.html"; 
    });

});