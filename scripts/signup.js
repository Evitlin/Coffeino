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

console.log("Firebase initialized:", firebase.apps.length > 0); // Should log true if Firebase is initialized

// Handle Signup
document.querySelector(".button-1").addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default behavior
    console.log("Sign Up button clicked");

    const name = document.querySelector("input[type='user-name']").value.trim();
    const email = document.querySelector("input[type='email']").value.trim();
    const password = document.querySelectorAll("input[type='password']")[0].value;
    const confirmPassword = document.querySelectorAll("input[type='password']")[1].value;
    const agreeToPrivacy = document.getElementById("agree1").checked;

    console.log("Name:", name); // Debugging log
    console.log("Email:", email); // Debugging log

    // Validate name
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|org|net|edu|gov|io|info|co)$/i;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate privacy policy agreement
    if (!agreeToPrivacy) {
        alert("You must agree to the Conditions of Use and Privacy Notice.");
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    // Validate password length
    if (password.length > 20) {
        alert("The password is too long. Please use a password with up to 20 characters.");
        return;
    }

    // Create user with Firebase Authentication
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            console.log("User created successfully:", userCredential); // Debugging log

            // User created successfully
            const user = userCredential.user;

            // Send email verification
            user.sendEmailVerification()
                .then(() => {
                    alert("A verification email has been sent to your email address. Please verify your email to activate your account.");
                    auth.signOut(); // Log the user out immediately after signup
                    window.location.href = "/login.html"; // Redirect to login page
                })
                .catch(error => {
                    console.error("Error sending email verification:", error); // Debugging log
                    alert("Failed to send verification email. Please try again later.");
                });

            // Optionally, update the user's display name
            user.updateProfile({
                displayName: name
            }).then(() => {
                console.log("Display name updated successfully.");
            });
        })
        .catch(error => {
            console.error("Error signing up:", error); // Debugging log
            let errorMessage = "An error occurred. Please try again later."; // Default error message

            // Handle specific Firebase errors
            switch (error.code) {
                case "auth/email-already-in-use":
                    errorMessage = "This email is already registered. Please use a different email or log in.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                case "auth/weak-password":
                    errorMessage = "The password is too weak. Please use a stronger password (at least 6 characters).";
                    break;
                case "auth/operation-not-allowed":
                    errorMessage = "Email/password accounts are not enabled. Please contact support.";
                    break;
                default:
                    errorMessage = error.message; // Use Firebase's error message as a fallback
            }

            alert(errorMessage); // Display the user-friendly error message
        });
});
