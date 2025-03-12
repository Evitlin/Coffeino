document.addEventListener("DOMContentLoaded", function () {
    const productsLink = document.getElementById("products-link");
    const dropdownMenu = document.getElementById("products-dropdown");
    const offset = 20;

    function updateDropdownPosition() {
        const rect = productsLink.getBoundingClientRect();
        dropdownMenu.style.top = `${rect.bottom + offset}px`;
        dropdownMenu.style.left = `${rect.left}px`;
        dropdownMenu.style.right = `${window.innerWidth - rect.right}px`;
    }

    productsLink.addEventListener("click", function (event) {
        event.preventDefault();
        dropdownMenu.classList.toggle("active");
        if (dropdownMenu.classList.contains("active")) {
            updateDropdownPosition();
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!productsLink.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove("active");
        }
    });

    // Ensure dropdown remains visible when scrolling
    window.addEventListener("scroll", function () {
        if (dropdownMenu.classList.contains("active")) {
            updateDropdownPosition();
        }
    });

    // Adjust dropdown layout based on screen width
    window.addEventListener("resize", function () {
        if (window.innerWidth <= 900) {
            dropdownMenu.classList.add("mobile");
        } else {
            dropdownMenu.classList.remove("mobile");
        }
    });

    // Initial check
    if (window.innerWidth <= 900) {
        dropdownMenu.classList.add("mobile");
    } else {
        dropdownMenu.classList.remove("mobile");
    }
});