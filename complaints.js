let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let complaints = JSON.parse(localStorage.getItem('complaints')) || [];

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => window.location.href = 'home.html', 1000);
        return;
    }

    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر

    if (['admin', 'super_admin'].includes(currentUser.role)) {
        document.getElementById('admin-complaints-section').classList.remove('d-none');
        loadAllComplaints();
    }

    loadUserComplaints();

    document.getElementById('complaint-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('complaint-spinner').style.display = 'block';
        const type = document.getElementById('complaint-type').value;
        const description = document.getElementById('complaint-description').value.trim();
        if (!type || !description) {
            showNotification('Please fill all required fields.', 'error');
            document.getElementById('complaint-spinner').style.display = 'none';
            return;
        }
        const complaint = {
            id: complaints.length + 1,
            user_id: currentUser.id,
            type,
            description,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            attachment: document.getElementById('complaint-attachment').files[0]?.name || null
        };
        complaints.push(complaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        showNotification('Complaint submitted successfully.', 'success');
        document.getElementById('complaint-form').reset();
        loadUserComplaints();
        if (['admin', 'super_admin'].includes(currentUser.role)) loadAllComplaints();
        document.getElementById('complaint-spinner').style.display = 'none';
    });
});

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    gsap.fromTo(notification, { opacity: 0, y: -20 }, {
        opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
        onComplete: () => setTimeout(() => {
            gsap.to(notification, { opacity: 0, y: -20, duration: 0.5, ease: 'power3.in', 
                onComplete: () => notification.className = 'notification' });
        }, 3000)
    });
}

function logout() {
    showNotification('Logged out successfully.', 'success');
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'home.html';
    }, 2000);
}

function loadUserComplaints() {
    const tbody = document.getElementById('user-complaints-table');
    tbody.innerHTML = '';
    const userComplaints = complaints.filter(c => c.user_id === currentUser.id);
    if (userComplaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No complaints found.</td></tr>';
    } else {
        userComplaints.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.type.charAt(0).toUpperCase() + c.type.slice(1)}</td>
                <td>${c.description.substring(0, 50)}${c.description.length > 50 ? '...' : ''}</td>
                <td>${c.date}</td>
                <td><span class="badge bg-${c.status === 'Resolved' ? 'success' : 'warning'}">${c.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function loadAllComplaints() {
    const tbody = document.getElementById('complaints-table');
    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companyComplaints = complaints.filter(c => {
        const user = users.find(u => u.id === c.user_id);
        return user && user.company === currentUser.company;
    });
    if (companyComplaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints found.</td></tr>';
    } else {
        companyComplaints.forEach(c => {
            const user = users.find(u => u.id === c.user_id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user ? user.email : 'Unknown'}</td>
                <td>${c.type.charAt(0).toUpperCase() + c.type.slice(1)}</td>
                <td>${c.description.substring(0, 30)}${c.description.length > 30 ? '...' : ''}</td>
                <td>${c.date}</td>
                <td><span class="badge bg-${c.status === 'Resolved' ? 'success' : 'warning'}">${c.status}</span></td>
                <td>
                    ${c.status === 'Pending' ? `
                        <button class="btn btn-success btn-sm me-2" onclick="updateComplaintStatus(${c.id}, 'Resolved')">Resolve</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function updateComplaintStatus(id, status) {
    complaints = complaints.map(c => c.id === id ? { ...c, status } : c);
    localStorage.setItem('complaints', JSON.stringify(complaints));
    showNotification(`Complaint ${status.toLowerCase()} successfully.`, 'success');
    loadAllComplaints();
    loadUserComplaints();
}