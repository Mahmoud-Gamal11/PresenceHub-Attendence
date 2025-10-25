let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let vacations = JSON.parse(localStorage.getItem('vacations')) || [];

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
        document.getElementById('admin-vacation-section').classList.remove('d-none');
        loadVacationRequests();
    }

    loadUserVacations();

    document.getElementById('vacation-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('vacation-spinner').style.display = 'block';
        const startDate = new Date(document.getElementById('vacation-start-date').value);
        const endDate = new Date(document.getElementById('vacation-end-date').value);
        const reason = document.getElementById('vacation-reason').value.trim();
        if (!startDate || !endDate || !reason) {
            showNotification('Please fill all fields.', 'error');
            document.getElementById('vacation-spinner').style.display = 'none';
            return;
        }
        if (startDate > endDate) {
            showNotification('Start date must be before end date.', 'error');
            document.getElementById('vacation-spinner').style.display = 'none';
            return;
        }
        const vacation = {
            id: vacations.length + 1,
            user_id: currentUser.id,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            reason,
            status: 'Pending'
        };
        vacations.push(vacation);
        localStorage.setItem('vacations', JSON.stringify(vacations));
        showNotification('Vacation request submitted.', 'success');
        document.getElementById('vacation-form').reset();
        loadUserVacations();
        if (['admin', 'super_admin'].includes(currentUser.role)) {
            loadVacationRequests();
        }
        document.getElementById('vacation-spinner').style.display = 'none';
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

function loadUserVacations() {
    const tbody = document.getElementById('user-vacation-table');
    tbody.innerHTML = '';
    const userVacations = vacations.filter(v => v.user_id === currentUser.id);
    if (userVacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No vacation requests found.</td></tr>';
    } else {
        userVacations.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${v.start_date}</td>
                <td>${v.end_date}</td>
                <td>${v.reason}</td>
                <td>${v.status}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function loadVacationRequests() {
    const tbody = document.getElementById('vacation-table');
    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companyVacations = vacations.filter(v => {
        const user = users.find(u => u.id === v.user_id);
        return user && user.company === currentUser.company;
    });
    if (companyVacations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No vacation requests found.</td></tr>';
    } else {
        companyVacations.forEach(v => {
            const user = users.find(u => u.id === v.user_id);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user ? user.email : 'Unknown'}</td>
                <td>${v.start_date}</td>
                <td>${v.end_date}</td>
                <td>${v.reason}</td>
                <td>${v.status}</td>
                <td>
                    ${v.status === 'Pending' ? `
                        <button class="btn btn-success btn-sm me-2" onclick="updateVacationStatus(${v.id}, 'Approved')">Approve</button>
                        <button class="btn btn-danger btn-sm" onclick="updateVacationStatus(${v.id}, 'Rejected')">Reject</button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function updateVacationStatus(id, status) {
    vacations = vacations.map(v => v.id === id ? { ...v, status } : v);
    localStorage.setItem('vacations', JSON.stringify(vacations));
    showNotification(`Vacation ${status.toLowerCase()} successfully.`, 'success');
    loadVacationRequests();
    loadUserVacations();
}