let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let checkIns = JSON.parse(localStorage.getItem('checkIns')) || [];

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
        return;
    }

    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر

    if (['admin', 'super_admin'].includes(currentUser.role)) {
        document.getElementById('admin-report-section').classList.remove('d-none');
        loadUsers();
    }

    loadReports();

    document.getElementById('report-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('report-spinner').style.display = 'block';
        const userId = document.getElementById('report-user').value;
        const startDate = new Date(document.getElementById('start-date').value);
        const endDate = new Date(document.getElementById('end-date').value);
        if (!userId || !startDate || !endDate) {
            showNotification('Please fill all fields.', 'error');
            document.getElementById('report-spinner').style.display = 'none';
            return;
        }
        if (startDate > endDate) {
            showNotification('Start date must be before end date.', 'error');
            document.getElementById('report-spinner').style.display = 'none';
            return;
        }
        loadReports(userId, startDate, endDate);
        document.getElementById('report-spinner').style.display = 'none';
    });
});

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    gsap.fromTo(notification, { opacity: 0, y: -20 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
            setTimeout(() => {
                gsap.to(notification, {
                    opacity: 0,
                    y: -20,
                    duration: 0.5,
                    ease: 'power3.in',
                    onComplete: () => notification.className = 'notification'
                });
            }, 3000);
        }
    });
}

function logout() {
    showNotification('Logged out successfully.', 'success');
    setTimeout(() => {
        localStorage.removeItem('currentUser');
        window.location.href = 'home.html';
    }, 2000);
}

function loadUsers() {
    const select = document.getElementById('report-user');
    select.innerHTML = '<option value="">Select User</option>';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companyUsers = users.filter(u => u.company === currentUser.company);
    companyUsers.forEach(u => {
        const option = document.createElement('option');
        option.value = u.id;
        option.textContent = u.email;
        select.appendChild(option);
    });
}

function loadReports(userId = currentUser.id, startDate = null, endDate = null) {
    const tbody = document.getElementById('report-table');
    tbody.innerHTML = '';
    let filteredCheckIns = checkIns.filter(c => c.user_id === parseInt(userId));
    if (startDate && endDate) {
        filteredCheckIns = filteredCheckIns.filter(c => {
            const date = new Date(c.timestamp);
            return date >= startDate && date <= endDate;
        });
    }
    if (filteredCheckIns.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No check-ins found.</td></tr>';
    } else {
        filteredCheckIns.forEach(c => {
            const user = (JSON.parse(localStorage.getItem('users')) || []).find(u => u.id === c.user_id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user ? user.email : 'Unknown'}</td>
                <td>${new Date(c.timestamp).toLocaleDateString()}</td>
                <td>${new Date(c.timestamp).toLocaleTimeString()}</td>
                <td>Lat: ${c.location.lat.toFixed(4)}, Lon: ${c.location.lon.toFixed(4)}</td>
                <td>${c.type ? c.type.charAt(0).toUpperCase() + c.type.slice(1) : 'Check-In'}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}