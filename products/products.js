import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgJ-IOeq76OCzmlUbGntMKmn550enir68",
  authDomain: "coffeino-3157b.firebaseapp.com",
  projectId: "coffeino-3157b",
  storageBucket: "coffeino-3157b.appspot.com",
  messagingSenderId: "739495575410",
  appId: "1:739495575410:web:07e74233accd8d6443a7eb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", function () {
    const productIds = [
      "5SFpPJFlxVgST0JKExgD",
      "9VtFXfRHxMBk9Rc1Cnw4",
      "eteYFSMnQYL9TNcGnxSf"
    ];
    const productsContainer = document.getElementById("products-container");

    // Declare the array to store promises
    const fetchPromises = productIds.map(id => {
        const docRef = doc(db, "products", id);
        return getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          const product = docSnap.data();

          const productCard = document.createElement("div");
          productCard.classList.add("product-card");

          productCard.innerHTML = `
            <img src="/products/${product.imageUrl}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.price}€</p>
            <button onclick="window.location.href='/products/product-details.html?id=${id}'">
              View Details
            </button>
          `;

          productsContainer.appendChild(productCard);
        } else {
          console.warn("Product not found:", id);
        }
      }).catch((error) => {
        console.error("Error fetching product:", error);
      });
    });

    // Wait for all fetch promises to resolve
    Promise.all(fetchPromises).then(() => {
        initArrows();  // Initialize arrows after products are loaded
        updateLayout(); // Then update layout after arrows are initialized
    }).catch((error) => {
        console.error("Error fetching products:", error);
    });

    function updateLayout() {
        const arrowLeft = document.querySelector('.arrow-left');
        const arrowRight = document.querySelector('.arrow-right');
        const products = document.querySelectorAll('.product-card');

        // Ensure arrows are available before accessing their styles
        if (arrowLeft && arrowRight) {
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
        } else {
            console.error('Arrows are not available in the DOM.');
        }
    }

    let currentIndex = 0;

    // Function to reset the active class for all products
    function resetActiveClass() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.classList.remove('active');
        });
    }

    // Initialize the arrows on mobile
    function initArrows() {
        const container = document.querySelector('.products-container');
        const arrowLeft = document.createElement('button');
        const arrowRight = document.createElement('button');

        arrowLeft.classList.add('arrow-button', 'arrow-left');
        arrowRight.classList.add('arrow-button', 'arrow-right');
        arrowLeft.innerHTML = '<';
        arrowRight.innerHTML = '>';
        container.appendChild(arrowLeft);
        container.appendChild(arrowRight);

        // Handle arrow clicks
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
    }

    // Function to move the products container (for mobile)
    function moveContainer(direction) {
        const products = document.querySelectorAll('.product-card');
        resetActiveClass();

        // Update index based on direction
        if (direction === 'left') {
            currentIndex = Math.max(currentIndex - 1, 0); 
        } else {
            currentIndex = Math.min(currentIndex + 1, products.length - 1); 
        }
        products[currentIndex].classList.add('active');
    }

    window.addEventListener('resize', updateLayout); // Adjust layout on window resize
});
