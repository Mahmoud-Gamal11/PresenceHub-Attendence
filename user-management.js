let currentUser = JSON.parse(localStorage.getItem('currentUser'));

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
        return;
    }

    if (!['admin', 'super_admin'].includes(currentUser.role)) {
        showNotification('Access denied. Admins only.', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        return;
    }

    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر

    document.getElementById('admin-section').classList.remove('d-none');
    loadUsers();

    document.getElementById('edit-user-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('edit-user-spinner').style.display = 'block';
        const id = parseInt(document.getElementById('edit-user-id').value);
        const email = document.getElementById('edit-email').value.trim();
        const role = document.getElementById('edit-role').value;
        const company = document.getElementById('edit-company').value.trim();
        if (!email || !role || !company) {
            showNotification('Please fill all fields.', 'error');
            document.getElementById('edit-user-spinner').style.display = 'none';
            return;
        }
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === email && u.id !== id);
        if (existingUser) {
            showNotification('Email already exists.', 'error');
            document.getElementById('edit-user-spinner').style.display = 'none';
            return;
        }
        users = users.map(u => u.id === id ? { id, email, role, company, password: u.password } : u);
        localStorage.setItem('users', JSON.stringify(users));
        if (currentUser.id === id) {
            currentUser = { id, email, role, company, password: currentUser.password };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        showNotification('User updated successfully.', 'success');
        document.getElementById('edit-user-spinner').style.display = 'none';
        bootstrap.Modal.getInstance(document.getElementById('edit-user-modal')).hide();
        loadUsers();
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
    const tbody = document.getElementById('user-table');
    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companyUsers = users.filter(u => u.company === currentUser.company);
    if (companyUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No users found.</td></tr>';
    } else {
        companyUsers.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.email}</td>
                <td>${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td>
                <td>${u.company}</td>
                <td>
                    <button class="btn btn-primary btn-sm me-2" onclick="openEditModal(${u.id}, '${u.email}', '${u.role}', '${u.company}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function openEditModal(id, email, role, company) {
    document.getElementById('edit-user-id').value = id;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-role').value = role;
    document.getElementById('edit-company').value = company;
    const modal = new bootstrap.Modal(document.getElementById('edit-user-modal'));
    modal.show();
}

function deleteUser(id) {
    if (id === currentUser.id) {
        showNotification('Cannot delete current user.', 'error');
        return;
    }
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users = users.filter(u => u.id !== id);
    localStorage.setItem('users', JSON.stringify(users));
    showNotification('User deleted successfully.', 'success');
    loadUsers();
}