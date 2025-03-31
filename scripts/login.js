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
    event.preventDefault(); // Prevent form submission

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate email and password
    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Check if the email is verified
            if (!user.emailVerified) {
                alert("Please verify your email address before logging in.");
                auth.signOut(); // Log the user out
                return;
            }

            alert(`Welcome back, ${user.displayName || "User"}!`);
            window.location.href = "/"; // Redirect to the homepage
        })
        .catch((error) => {
            console.error("Login error:", error);
            let errorMessage = "An error occurred. Please try again later."; // Default error message

            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                case "auth/user-disabled":
                    errorMessage = "This user account has been disabled. Please contact support.";
                    break;
                case "auth/user-not-found":
                case "auth/wrong-password":
                case "auth/invalid-credential": // Treat invalid credentials as wrong password
                    errorMessage = "Incorrect email or password. Please try again.";
                    break;
                default:
                    errorMessage = error.message; // Use Firebase's error message as a fallback
            }

            alert(errorMessage); // Display the user-friendly error message
        });
});

// Handle Resend Verification Email
document.getElementById("resend-verification-button").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default behavior

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate email and password
    if (!email || !password) {
        alert("Please enter both email and password to resend the verification email.");
        return;
    }

    // Attempt to sign in the user
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Check if the email is already verified
            if (user.emailVerified) {
                alert("Your email is already verified. You can log in.");
                return;
            }

            // Resend the verification email
            user.sendEmailVerification()
                .then(() => {
                    alert("A new verification email has been sent to your email address. Please check your inbox.");
                    auth.signOut(); // Log the user out after resending the email
                })
                .catch((error) => {
                    console.error("Error resending verification email:", error);
                    alert("Failed to resend verification email. Please try again later.");
                });
        })
        .catch((error) => {
            console.error("Error signing in for resend verification:", error);

            // Handle specific errors
            let errorMessage = "An error occurred. Please try again later.";
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "This email is not registered. Please sign up first.";
                    break;
                case "auth/wrong-password":
                case "auth/invalid-credential": // Treat invalid credentials as wrong password
                    errorMessage = "Incorrect email or password. Please try again.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                default:
                    errorMessage = error.message; // Use Firebase's error message as a fallback
            }

            alert(errorMessage); // Display the user-friendly error message
        });
});

// Handle Forgot Password
document.getElementById("forgot-password-link").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default behavior

    const email = document.getElementById("email").value.trim();

    // Validate email
    if (!email) {
        alert("Please enter your email address to reset your password.");
        return;
    }

    // Send password reset email
    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("A password reset email has been sent to your email address. Please check your inbox.");
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);

            // Handle specific errors
            let errorMessage = "An error occurred. Please try again later.";
            switch (error.code) {
                case "auth/user-not-found":
                    errorMessage = "This email is not registered. Please sign up first.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                default:
                    errorMessage = error.message; // Use Firebase's error message as a fallback
            }

            alert(errorMessage); // Display the user-friendly error message
        });
});