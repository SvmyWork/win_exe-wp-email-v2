import { CONFIG } from './config.js'; // make sure config.js exports CONFIG correctly
let recipients = [];
let filteredRecipients = [];
let sortDirection = {};
console.log('CONFIG loaded in recipients.js:', CONFIG);
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    loadRecipients();
    
    document.getElementById('searchInput').addEventListener('input', filterRecipients);
    document.getElementById('filterStatus').addEventListener('change', filterRecipients);
    document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

async function loadRecipients() {
    const apiUrl = `${CONFIG.API_URL}/api/win-company-data`; // ✅ API endpoint

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Token added as Bearer
            },
            body: JSON.stringify({
                company_id: localStorage.getItem('companyid')
            })
        });

        const result = await response.json();

        // ✅ Validate API response
        if (result.status === 'success' && Array.isArray(result.data)) {
            recipients = result.data.map((item, index) => ({
                id: item.id || index + 1,
                name: item.name || 'Unknown',
                email: item.email || 'Not Found',
                phone: item.phone || 'Not Found',
                company: item.name || 'N/A',
                hrName: item.job_title || 'N/A',
                template: item.job_title || 'General',
                emailTitle: item.email_subject || 'No Subject',
                emailContent: item.email_content || 'No content available.',
                phoneContent: item.phone_content || 'No content available.',
                status: item.email_status || 'pending',
                followUp: item.follow_up ? JSON.parse(item.follow_up) : [],
                source: item.source || '',
                city: item.city || '',
                state: item.state || '',
                country: item.country || ''
            }));

            localStorage.setItem('recipients', JSON.stringify(recipients));
            console.log('✅ Recipients loaded from API:', recipients);
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('❌ Error loading recipients from API:', error);

        // fallback — try localStorage
        recipients = JSON.parse(localStorage.getItem('recipients') || '[]');

        // if still empty, use default dummy data
        if (recipients.length === 0) {
            recipients = getDefaultRecipients();
        }
    }

    filteredRecipients = [...recipients];
    renderTable();
}


// 🔹 Default recipients (only used if API or cache fails)
function getDefaultRecipients() {
    return [
        { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Tech Corp', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'Design Studio', status: 'inactive' }
    ];
}

// Call on page load
document.addEventListener('DOMContentLoaded', loadRecipients);


function filterRecipients() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;
    
    filteredRecipients = recipients.filter(recipient => {
        const matchesSearch = recipient.name.toLowerCase().includes(searchTerm) ||
                            recipient.email.toLowerCase().includes(searchTerm) ||
                            recipient.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || recipient.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderTable();
}

function sortTable(field) {
    if (!sortDirection[field]) {
        sortDirection[field] = 'asc';
    } else {
        sortDirection[field] = sortDirection[field] === 'asc' ? 'desc' : 'asc';
    }
    
    filteredRecipients.sort((a, b) => {
        let aVal = a[field].toLowerCase();
        let bVal = b[field].toLowerCase();
        
        if (sortDirection[field] === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('recipientsTable');
    tbody.innerHTML = '';
    
    filteredRecipients.forEach(recipient => {
        const statusClass = recipient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition';
        row.innerHTML = `
            
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span class="text-purple-600 font-semibold">${recipient.name.charAt(0)}</span>
                    </div>
                    <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">${recipient.name}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${recipient.email}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${recipient.phone}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                    ${recipient.status}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('showingCount').textContent = filteredRecipients.length;
    document.getElementById('totalCount').textContent = recipients.length;
}

function toggleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.recipient-row-checkbox');
    checkboxes.forEach(checkbox => checkbox.checked = e.target.checked);
}

function openAddModal() {
    document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
    document.getElementById('addModal').classList.add('hidden');
    const form = document.getElementById('addRecipientForm');
    form.reset();
}

function submitAddRecipient() {
    const form = document.getElementById('addRecipientForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const newRecipient = {
        id: recipients.length > 0 ? Math.max(...recipients.map(r => r.id)) + 1 : 1,
        name: document.getElementById('newName').value,
        email: document.getElementById('newEmail').value,
        phone: document.getElementById('newPhone').value,
        company: document.getElementById('newCompany').value || '',
        hrName: document.getElementById('newHrName').value || '',
        template: document.getElementById('newTemplate').value || 'Default',
        emailTitle: document.getElementById('newEmailTitle').value || '',
        emailContent: document.getElementById('newEmailContent').value || '',
        status: document.getElementById('newStatus').value
    };
    
    recipients.push(newRecipient);
    localStorage.setItem('recipients', JSON.stringify(recipients));
    
    closeAddModal();
    filterRecipients();
    
    showNotification('Recipient added successfully!', 'success');
}

function editRecipient(id) {
    const recipient = recipients.find(r => r.id === id);
    if (!recipient) return;
    
    const newName = prompt('Enter new name:', recipient.name);
    if (newName) recipient.name = newName;
    
    const newEmail = prompt('Enter new email:', recipient.email);
    if (newEmail) recipient.email = newEmail;
    
    const newPhone = prompt('Enter new phone:', recipient.phone);
    if (newPhone) recipient.phone = newPhone;
    
    localStorage.setItem('recipients', JSON.stringify(recipients));
    filterRecipients();
    showNotification('Recipient updated successfully!', 'success');
}

function deleteRecipient(id) {
    if (confirm('Are you sure you want to delete this recipient?')) {
        recipients = recipients.filter(r => r.id !== id);
        localStorage.setItem('recipients', JSON.stringify(recipients));
        filterRecipients();
        showNotification('Recipient deleted successfully!', 'success');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        window.location.href = 'index.html';
    }
}
