import { CONFIG } from './config.js'; // make sure config.js exports CONFIG correctly

document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // If already logged in, redirect
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const button = loginForm.querySelector('button[type="submit"]');

        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }

        // Loading spinner
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';
        button.disabled = true;

        try {
            // 🔹 Make API call
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);
            const response = await fetch(`${CONFIG.API_URL}/api/app-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json, text/plain, */*',
                },
                body: params,
            });

            let data;
            try {
                if (!response.ok) {
                    // Try to get error message from response
                    const text = await response.text();
                    throw new Error(text || `HTTP error: ${response.status}`);
                }
                data = await response.json();
            } catch (jsonErr) {
                console.error('Failed to parse JSON:', jsonErr);
                alert('Server returned an invalid response. Please try again later.');
                button.innerHTML = 'Login';
                button.disabled = false;
                return;
            }

            console.log('API Response:', data);

            if (data.status == 'success') {
                // ✅ Save login status
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('token', data.token || '');
                localStorage.setItem('companyid', data.companyid || '');

                const result = await window.pywebview.api.update_user_info(username, password);
                console.log('User info updated in backend:', result);
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Invalid username or password');
                button.innerHTML = 'Login';
                button.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Unable to connect to server. Please try again.');
            button.innerHTML = 'Login';
            button.disabled = false;
        }
    });
});
