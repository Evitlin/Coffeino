document.addEventListener("DOMContentLoaded", function(){
    const cartBtn = document.getElementById("cart-btn");
    const cartModal = document.getElementById("cart-modal");
    const closeBtn = document.getElementById("close-btn");

    let isFullScreen=false;

    cartBtn.addEventListener("click", function () {
        if(cartModal.classList.contains("active")){
            if(isFullScreen){
                cartModal.classList.remove("full-screen");
                isFullScreen=false;
            }else{
                cartModal.classList.add("full-screen");
                isFullScreen=true;
            }
        }else{
            cartModalclassList.add("active");

        }
        //cartModal.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
        cartModal.classList.remove("active");
        cartModal.classList.remove("full-screen");
        isFullScreen = false;
        
        //cartModal.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === cartModal) {
            cartModal.classList.remove("active");
            cartModal.classList.remove("full-screen");
            isFullScreen = false;
            //cartModal.style.display = "none";
        }
    });

   
    document.getElementById("go-shopping-btn").addEventListener("click", function () {
        
        window.location.href = "product.html"; 
    });

});