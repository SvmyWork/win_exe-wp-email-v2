let isSending = false;
import { CONFIG } from './config.js'; // make sure config.js exports CONFIG correctly
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const channel = localStorage.getItem('selectedChannel') || 'email';
    const channelIcon = document.getElementById('channelIcon');
    const channelTitle = document.getElementById('channelTitle');
    const channelBadge = document.getElementById('channelBadge');

    if (channel === 'email') {
        channelIcon.className = 'fas fa-envelope text-blue-600';
        channelTitle.textContent = 'Send Email Messages';
        channelBadge.innerHTML = '<i class="fas fa-envelope mr-2"></i>Email';
    } else {
        channelIcon.className = 'fab fa-whatsapp text-green-600';
        channelTitle.textContent = 'Send WhatsApp Messages';
        channelBadge.innerHTML = '<i class="fab fa-whatsapp mr-2"></i>WhatsApp';
    }

    loadRecipients();
    
    document.getElementById('messageContent').addEventListener('input', updateCharCount);
    document.getElementById('sendBtn').addEventListener('click', sendMessages);
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('downloadLogsBtn').addEventListener('click', downloadLogs);
});

function updateCharCount() {
    const content = document.getElementById('messageContent').value;
    document.getElementById('charCount').textContent = content.length;
}


async function loadRecipients() {
    const apiUrl = `${CONFIG.API_URL}/api/win-company-data`;
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('companyid');
    const channel = localStorage.getItem('selectedChannel') || 'email';
    const tbody = document.getElementById('recipientsTableBody');
    const contactHeader = document.getElementById('contactHeader');
    const selectAll = document.getElementById('selectAllRecipients');
    const loader = document.getElementById('tableLoader'); // 👈 Loader element
    let recipients = [];

    if (!tbody || !contactHeader) {
        console.error('⚠️ Missing table elements in DOM.');
        return;
    }

    // 🌀 Show loader & clear table
    if (loader) loader.classList.remove('hidden');
    tbody.innerHTML = '';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ company_id: companyId })
        });

        const result = await response.json();

        if (result.status === 'success' && Array.isArray(result.data)) {
            console.log('✅ Recipients loaded from API:', result.data);
            recipients = result.data.map((item, index) => ({
                id: item.id || index + 1,
                name: item.name || 'Unknown',
                email: item.email || 'Not Found',
                phone: item.phone || 'Not Found',
                company: item.name || 'N/A',
                hrName: 'Sarah Johnson',
                template: 'View',
                emailTitle: item.email_subject || 'Welcome',
                emailContent: item.email_content || 'Hi {name}, welcome!',
                email_status: item.email_status || 'pending',
                wp_content: item.phone_content || 'No content available.',
                wp_status: item.phone_status || 'pending',
            }));
            console.log('✅ Recipients processed:', recipients);
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.warn('⚠️ API failed, loading from localStorage:', error);
        if (recipients.length === 0) {
            console.warn('⚠️ No local data found — using sample recipients.');
            recipients = getSampleRecipients();
        }
    } finally {
        // 🛑 Hide loader when API is done
        if (loader) loader.classList.add('hidden');
    }

    // 🧩 Update UI
    contactHeader.textContent = channel === 'email' ? 'Email' : 'Phone No';
    tbody.innerHTML = '';

    // ✅ Filter by selected channel status
    const filteredRecipients = recipients.filter(r => {
        if (channel === 'email') {
            return ['active', 'Queued', 'pending'].includes(r.email_status);
        } else {
            return ['active', 'Queued', 'pending'].includes(r.wp_status);
        }
    });

    console.log(`📬 Showing ${filteredRecipients.length} recipients for channel: ${channel}`);

    if (channel !== 'email') {
        document.getElementById('sendBtn').innerText = 'Open WhatsApp';
    }

    filteredRecipients.forEach(recipient => {
        const contact = channel === 'email' ? recipient.email : recipient.phone;
        const status = channel === 'email' ? recipient.email_status : recipient.wp_status;
        const content = channel === 'email' ? recipient.emailContent : recipient.wp_content;
        const statusColor =
            status === 'Queued' ? 'bg-yellow-100 text-yellow-800' :
            status === 'pending' ? 'bg-gray-100 text-gray-800' :
            status === 'active' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800';

        const row = document.createElement('tr');
        row.className = 'hover:bg-purple-50 cursor-pointer transition';
        row.dataset.recipientId = recipient.id;

        row.innerHTML = `
            <td class="px-3 py-3" onclick="event.stopPropagation()">
                <input type="checkbox" class="w-4 h-4 text-purple-600 rounded recipient-checkbox" value="${recipient.id}">
            </td>
            <td class="px-3 py-3 font-medium text-gray-900">${recipient.name}</td>
            <td class="px-3 py-3 text-gray-700">${contact}</td>
            <td class="px-3 py-3 text-gray-700">${recipient.company || '-'}</td>
            <td class="px-3 py-3 text-gray-700">${recipient.hrName || '-'}</td>
            <td class="px-3 py-3">
                <span class="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
                    ${recipient.template || 'Default'}
                </span>
            </td>
            <td class="px-3 py-3">
                <span class="px-2 py-1 ${statusColor} rounded text-xs font-medium">
                    ${status}
                </span>
            </td>
        `;

        row.addEventListener('click', (e) => {
            if (!e.target.classList.contains('recipient-checkbox')) {
                loadTemplate(recipient, channel);
            }
        });

        tbody.appendChild(row);
    });

    if (selectAll) {
        selectAll.addEventListener('change', toggleSelectAll);
    }

    localStorage.setItem('recipients', JSON.stringify(recipients));
}



// 🧱 Default dummy data
function getSampleRecipients() {
    return [
        { 
            id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', 
            company: 'Tech Corp', hrName: 'Sarah Johnson',
            template: 'Welcome Template', emailTitle: 'Welcome',
            emailContent: 'Hi {name}, welcome!', status: 'active'
        },
        { 
            id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', 
            company: 'Design Studio', hrName: 'Michael Brown',
            template: 'Follow-up', emailTitle: 'Follow-up',
            emailContent: 'Hi {name}, checking in!', status: 'active'
        }
    ];
}


function loadTemplate(recipient, channel) {
    const content = channel === 'email' ? recipient.emailContent : recipient.wp_content;
    const title = channel === 'email' ? recipient.emailTitle : '';
    // const title = recipient.emailTitle || '';
    // const content = recipient.emailContent || '';
    
    let personalizedTitle = title.replace(/{name}/g, recipient.name)
                                 .replace(/{company}/g, recipient.company || '')
                                 .replace(/{hrName}/g, recipient.hrName || '');
    
    let personalizedContent = content.replace(/{name}/g, recipient.name)
                                    .replace(/{company}/g, recipient.company || '')
                                    .replace(/{hrName}/g, recipient.hrName || '');
    
    document.getElementById('messageSubject').value = personalizedTitle;
    document.getElementById('messageContent').value = personalizedContent;
    updateCharCount();
    
    addLog(`Template "${recipient.template}" loaded for ${recipient.name}`, 'info');
    
    const row = document.querySelector(`tr[data-recipient-id="${recipient.id}"]`);
    document.querySelectorAll('#recipientsTableBody tr').forEach(r => r.classList.remove('bg-purple-100'));
    if (row) {
        row.classList.add('bg-purple-100');
    }
}

function toggleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.recipient-checkbox');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
}

function addLog(message, type = 'info') {
    const container = document.getElementById('logsContainer');
    const timestamp = new Date().toLocaleTimeString();
    
    if (container.querySelector('.text-center')) {
        container.innerHTML = '';
    }

    const iconMap = {
        info: 'fa-info-circle text-blue-500',
        success: 'fa-check-circle text-green-500',
        error: 'fa-exclamation-circle text-red-500',
        warning: 'fa-exclamation-triangle text-yellow-500'
    };

    const logEntry = document.createElement('div');
    logEntry.className = 'p-3 bg-gray-50 rounded-lg slide-in';
    logEntry.innerHTML = `
        <div class="flex items-start">
            <i class="fas ${iconMap[type]} mt-1 mr-2"></i>
            <div class="flex-1">
                <p class="text-sm text-gray-800">${message}</p>
                <p class="text-xs text-gray-500 mt-1">${timestamp}</p>
            </div>
        </div>
    `;
    
    container.insertBefore(logEntry, container.firstChild);
    
    if (container.children.length > 50) {
        container.removeChild(container.lastChild);
    }
}

function updateProgress(current, total) {
    const percentage = Math.round((current / total) * 100);
    document.getElementById('progressBar').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';
    document.getElementById('progressSection').classList.remove('hidden');
}

async function sendMessages() {
    if (isSending) return;

    const selectedCheckboxes = document.querySelectorAll('.recipient-checkbox:checked');
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');

    if (selectedCheckboxes.length === 0) {
        addLog('Please select at least one recipient', 'error');
        return;
    }

    if (Object.keys(settings).length === 0) {
        addLog('Please configure your settings before sending messages', 'error');
        return;
    }

    isSending = true;
    const sendBtn = document.getElementById('sendBtn');
    const originalText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
    sendBtn.disabled = true;

    const channel = localStorage.getItem('selectedChannel');
    const recipients = JSON.parse(localStorage.getItem('recipients') || '[]');
    const selectedRecipients = Array.from(selectedCheckboxes).map(cb => 
        recipients.find(r => r.id == cb.value)
    );

    const delay = parseInt(localStorage.getItem('messageDelay') || '2') * 1000;

    addLog(`Starting to send ${selectedRecipients.length} ${channel} messages...`, 'info');

    // ✅ Correct way: pass arguments in order
    const result = await window.pywebview.api.send_sms(selectedRecipients, channel, delay, settings);
    console.log(result);

    function py_add_log(text) {
        addLog(`✓ Successfully sent to ${text}`, 'success');
    }
    // for (let i = 0; i < selectedRecipients.length; i++) {
    //     const recipient = selectedRecipients[i];
    //     if (!recipient) continue;

    //     // ✅ Get message content directly from recipient
    //     const subject = recipient.emailTitle || 'No Subject';
    //     const content = recipient.emailContent || '';

    //     const contact = channel === 'email' ? recipient.email : recipient.phone;

    //     updateProgress(i, selectedRecipients.length);
    //     addLog(`Sending to ${recipient.name} (${contact})...`, 'info');

    //     await new Promise(resolve => setTimeout(resolve, delay));

    //     // Simulate random send success/failure
    //     const success = Math.random() > 0.1;

    //     if (success) {
    //         addLog(`✓ Successfully sent to ${recipient.name}`, 'success');
    //     } else {
    //         addLog(`✗ Failed to send to ${recipient.name}`, 'error');
    //     }
    // }

    // updateProgress(selectedRecipients.length, selectedRecipients.length);

    const successCount = selectedRecipients.length - Math.floor(Math.random() * 2);
    // addLog(`Campaign completed! ${successCount}/${selectedRecipients.length} messages sent successfully`, 'success');

    setTimeout(() => {
        sendBtn.innerHTML = originalText;
        sendBtn.disabled = false;
        isSending = false;
    }, 1000);
}


function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}

async function downloadLogs() {
    const logsContainer = document.getElementById('logsContainer');
    if (!logsContainer) return;

    let logsText = '';
    logsContainer.querySelectorAll('*').forEach(el => {
        if (el.innerText.trim()) logsText += el.innerText.trim() + '\n';
    });

    if (!logsText.trim()) {
        addLog('No logs available to download.', 'warning');
        alert('No logs available to download.');
        return;
    }

    // ✅ If running inside PyWebView
    if (window.pywebview && window.pywebview.api && window.pywebview.api.save_logs) {
        try {
            const result = await window.pywebview.api.save_logs(logsText);
            if (result.status === 'success') {
                addLog(`Logs saved to: ${result.path}`, 'success');
                alert(`Logs saved successfully at:\n${result.path}`);
            } else {
                addLog(`Error saving logs: ${result.message}`, 'error');
            }
        } catch (err) {
            addLog(`Failed to save logs: ${err.message}`, 'error');
        }
        return;
    }

    // ✅ Normal browser download fallback
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messaginghub_logs_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addLog('Logs downloaded successfully.', 'success');
}
