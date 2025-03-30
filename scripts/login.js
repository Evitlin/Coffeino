        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyCgJ-IOeq76OCzmlUbGntMKmn550enir68",
            authDomain: "coffeino-3157b.firebaseapp.com",
            projectId: "coffeino-3157b",
            storageBucket: "coffeino-3157b.appspot.com",
            messagingSenderId: "739495575410",
            appId: "1:739495575410:web:07e74233accd8d6443a7eb"
        };
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        // Handle Login
        document.getElementById("login-button").addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // User logged in successfully
                    alert("Logged in successfully!");
                    window.location.href = "/index.html"; // Redirect to homepage
                })
                .catch(error => {
                    console.error("Error logging in:", error.message);
                    alert(error.message);
                });
        });