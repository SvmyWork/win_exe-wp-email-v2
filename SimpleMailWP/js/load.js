// Run this once the page and PyWebView API are ready
window.addEventListener('pywebviewready', async () => {
    console.log("✅ PyWebView is ready. Loading user info...");

    try {
        // Wait for data from Python side
        const result = await window.pywebview.api.load_user_info();
        if (!result) {
            throw new Error('No data received from backend');
        }

        const user_info = result.user || {};
        const credentials = result.credentials || {};

        // Fill input fields
        document.getElementById('username').value = user_info.username || '';
        document.getElementById('password').value = user_info.password || '';

        // Save credentials into local storage
        localStorage.setItem('settings', JSON.stringify(credentials));

        console.log("User info loaded:", user_info);
        console.log("Credentials saved:", credentials);

    } catch (err) {
        console.error("❌ Error loading user info:", err);

        // Optional: fallback if running outside PyWebView
        if (!window.pywebview) {
            console.warn("PyWebView not available. Using fallback data for browser testing.");
            localStorage.setItem('settings', JSON.stringify({}));
        }
    }
});
