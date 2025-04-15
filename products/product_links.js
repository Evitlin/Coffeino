    const productsLink = document.getElementById("products-link");
    const dropdownMenu = document.getElementById("products-dropdown");
    const offset = 20;

    
    function updateDropdownPosition() { 
        if (window.innerWidth > 900) {
            const rect = productsLink.getBoundingClientRect();
            dropdownMenu.style.top = `${rect.bottom + offset}px`;
            dropdownMenu.style.left = `${rect.left}px`;
            dropdownMenu.style.right = `${window.innerWidth - rect.right}px`;
        } else {
            dropdownMenu.style.position = "relative";
            dropdownMenu.style.top = "15px";
            dropdownMenu.style.left = "unset";
            dropdownMenu.style.right = "unset";
        }
    }

    let isMobile = window.innerWidth <= 900;

    function updateDeviceType() {
        const nowMobile = window.innerWidth <= 900;
        if (nowMobile !== isMobile) {
            isMobile = nowMobile;
    
            // Reset dropdown styles and state when switching layouts
            dropdownMenu.classList.remove("active");
            dropdownMenu.classList.remove("mobile");
            dropdownMenu.style.top = "";
            dropdownMenu.style.left = "";
            dropdownMenu.style.right = "";
            dropdownMenu.style.position = ""; // <--- THIS FIXES YOUR ISSUE
        }
    
        // Apply mobile-specific class
        if (isMobile) {
            dropdownMenu.classList.add("mobile");
        }
    }

// Initial check
updateDeviceType();

// Watch for resize
window.addEventListener("resize", updateDeviceType);

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
    // Initial check
    if (window.innerWidth <= 900) {
        dropdownMenu.classList.add("mobile");
    } else {
        dropdownMenu.classList.remove("mobile");
    }
