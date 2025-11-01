document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const username = localStorage.getItem('username') || 'User';
    document.getElementById('userDisplay').textContent = `Welcome, ${username}`;

    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function selectChannel(channel) {
    localStorage.setItem('selectedChannel', channel);
    window.location.href = 'send.html';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}
