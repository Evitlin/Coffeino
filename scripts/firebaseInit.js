function loadFirebaseInit() {
    return new Promise((resolve, reject) => {
        if (typeof firebase === "undefined" || !firebase.apps.length) {
            const firebaseAppScript = document.createElement('script');
            firebaseAppScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
            firebaseAppScript.onload = () => {
                const firebaseAuthScript = document.createElement('script');
                firebaseAuthScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";
                firebaseAuthScript.onload = () => {
                    const firebaseFirestoreScript = document.createElement('script');
                    firebaseFirestoreScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
                    firebaseFirestoreScript.onload = () => {
                        const firebaseConfig = {
                            apiKey: "AIzaSyCgJ-IOeq76OCzmlUbGntMKmn550enir68",
                            authDomain: "coffeino-3157b.firebaseapp.com",
                            projectId: "coffeino-3157b",
                            storageBucket: "coffeino-3157b.appspot.com",
                            messagingSenderId: "739495575410",
                            appId: "1:739495575410:web:07e74233accd8d6443a7eb"
                        };
                        if (!firebase.apps.length) {
                            firebase.initializeApp(firebaseConfig);
                            window.db = firebase.firestore(); // Make Firestore globally accessible
                            window.auth = firebase.auth(); // Make Auth globally accessible
                        }
                        // Dispatch the firebase-ready event
                        window.dispatchEvent(new Event('firebase-ready'));
                        resolve();
                    };
                    firebaseFirestoreScript.onerror = reject;
                    document.head.appendChild(firebaseFirestoreScript);
                };
                firebaseAuthScript.onerror = reject;
                document.head.appendChild(firebaseAuthScript);
            };
            firebaseAppScript.onerror = reject;
            document.head.appendChild(firebaseAppScript);
        } else {
            console.warn("Firebase is already initialized.");
            window.dispatchEvent(new Event('firebase-ready'));
            resolve();
        }
    });
}

if (typeof module !== "undefined") {
    module.exports = { loadFirebaseInit };
}