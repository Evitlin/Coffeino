// Handle Login
document.getElementById("login-button").addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            if (!user.emailVerified) {
                alert("Please verify your email address before logging in.");
                auth.signOut();
                return;
            }

            const userDoc = await db.collection("users").doc(user.uid).get();
            const userData = userDoc.data();
    
            if (userData && userData.role === "admin") {
                // Redirect to admin-reports.html if the user is an admin
                alert(`Welcome back, Admin ${user.displayName || "User"}!`);
                window.location.href = "/admin/admin-reports.html";
            } else {
                // Redirect to the homepage for regular users
                alert(`Welcome back, ${user.displayName || "User"}!`);
                window.location.href = "/";
            }
        })
        .catch((error) => {
            console.error("Login error:", error);
            let errorMessage = "An error occurred. Please try again later.";

            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                case "auth/user-disabled":
                    errorMessage = "This user account has been disabled. Please contact support.";
                    break;
                case "auth/user-not-found":
                case "auth/wrong-password":
                case "auth/invalid-credential":
                    errorMessage = "Incorrect email or password. Please try again.";
                    break;
                default:
                    errorMessage = error.message;
            }

            alert(errorMessage);
        });
});

// Handle Resend Verification Email
document.getElementById("resend-verification-button").addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter both email and password to resend the verification email.");
        return;
    }

    // Attempt to sign in the user
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

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
let lastResetRequestTime = null;

document.getElementById("forgot-password-link").addEventListener("click", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        alert("Please enter your email address to reset your password.");
        return;
    }

    const now = Date.now();
    if (lastResetRequestTime && now - lastResetRequestTime < 600000) { // 10 minutes
        alert("You can only request a password reset once every 10 minutes. Please try again later.");
        return;
    }

    // Proceed with sending the password reset email
    lastResetRequestTime = now;

    auth.sendPasswordResetEmail(email)
        .then(() => {
            alert("A password reset email has been sent to your email address. Please check your inbox.");
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);

            let errorMessage = "Failed to send password reset email. Please try again later.";
            switch (error.code) {
                case "auth/invalid-email":
                    errorMessage = "The email address is not valid. Please check and try again.";
                    break;
                case "auth/user-not-found":
                    errorMessage = "This email is not registered. Please check your email address or sign up.";
                    break;
                default:
                    errorMessage = error.message; // Use Firebase's error message as a fallback
            }

            alert(errorMessage);
        });
});