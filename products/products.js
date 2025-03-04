document.addEventListener("DOMContentLoaded", function () {
    const products = [
        { name: "dark roast coffee", price: "12.99€", image: "../products/product_images/product1.png" },
         {name: "matcha green tea", price: "14.99€", image: "../products/product_images/product2.png" },
         {name: "cytrus energy drink", price: "2.99€", image: "../products/product_images/product3.png" }
    ];

    const productsContainer = document.getElementById("products-container");

    products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.price}</p>
            <button>add to cart</button>
        `;
        productsContainer.appendChild(productCard);
    });
});

//arrows
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.products-container');
    const products = document.querySelectorAll('.product-card');
    const arrowLeft = document.createElement('button');
    const arrowRight = document.createElement('button');
    
    arrowLeft.classList.add('arrow-button', 'arrow-left');
    arrowRight.classList.add('arrow-button', 'arrow-right');
    arrowLeft.innerHTML = '<';
    arrowRight.innerHTML = '>';
    container.appendChild(arrowLeft);
    container.appendChild(arrowRight);

    let currentIndex = 0;

    // Function to reset the active class for all products
    function resetActiveClass() {
        products.forEach(product => {
            product.classList.remove('active');
        });
    }

    function updateLayout() {
        if (window.innerWidth > 900) {
            // Desktop: All cards should be visible
            resetActiveClass();
            products.forEach(product => {
                product.classList.add('active');
            });
            arrowLeft.style.display = 'none'; 
            arrowRight.style.display = 'none'; 
        } else {
            // Mobile: Show only one card at a time and set up arrows
            resetActiveClass();
            products[currentIndex].classList.add('active');
            arrowLeft.style.display = 'block'; 
            arrowRight.style.display = 'block'; 
        }
    }
    updateLayout();
    window.addEventListener('resize', updateLayout);
    arrowLeft.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
            moveContainer('left');
        }
    });
    
    arrowRight.addEventListener('click', function () {
        if (window.innerWidth <= 900) {
            moveContainer('right');
        }
    });

    // Function to move the products container (for mobile)
    function moveContainer(direction) {
        resetActiveClass(); 
        
        // Update index based on direction
        if (direction === 'left') {
            currentIndex = Math.max(currentIndex - 1, 0); 
        } else {
            currentIndex = Math.min(currentIndex + 1, products.length - 1); 
        }
        products[currentIndex].classList.add('active');
    }
});

