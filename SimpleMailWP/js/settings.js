document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    loadSettings();
    
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    
    document.getElementById('senderEmail').value = settings.senderEmail || '';
    document.getElementById('senderName').value = settings.senderName || '';
    document.getElementById('appPassword').value = settings.appPassword || '';
    document.getElementById('emailTracking').checked = settings.emailTracking !== false;
    
    document.getElementById('whatsappNumber').value = settings.whatsappNumber || '';
    document.getElementById('whatsappBusinessName').value = settings.whatsappBusinessName || '';
    document.getElementById('userDataPath').value = settings.userDataPath || '';
    document.getElementById('whatsappReceipts').checked = settings.whatsappReceipts !== false;
    
    document.getElementById('messageDelay').value = settings.messageDelay || 2;
    document.getElementById('autoSave').checked = settings.autoSave !== false;
    document.getElementById('notifications').checked = settings.notifications !== false;
}

async function saveSettings() {
    try {
        const settings = {
            senderEmail: document.getElementById('senderEmail').value,
            senderName: document.getElementById('senderName').value,
            appPassword: document.getElementById('appPassword').value,
            emailTracking: document.getElementById('emailTracking').checked,
            
            whatsappNumber: document.getElementById('whatsappNumber').value,
            whatsappBusinessName: document.getElementById('whatsappBusinessName').value,
            userDataPath: document.getElementById('userDataPath').value,
            whatsappReceipts: document.getElementById('whatsappReceipts').checked,
            
            messageDelay: document.getElementById('messageDelay').value,
            autoSave: document.getElementById('autoSave').checked,
            notifications: document.getElementById('notifications').checked
        };
        
        localStorage.setItem('settings', JSON.stringify(settings));
        
        const btn = document.getElementById('saveSettingsBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Saving...';
        btn.classList.add('bg-green-500');
        
        await window.pywebview.api.update_credentials(settings);
        
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Settings Saved!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-500');
        }, 2000);
        
        showNotification('Settings saved successfully!', 'success');
    } catch (error) {
        showNotification('Error saving settings: ' + error.message, 'error');
        console.error('Save settings error:', error);
    }
}

function showNotification(message, type) {
    const colorMap = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg ${colorMap[type] || 'bg-blue-500'} text-white z-50 transition-all max-w-md`;
    notification.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${iconMap[type] || 'fa-info-circle'} mr-2 mt-1"></i>
            <span class="text-sm">${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}
