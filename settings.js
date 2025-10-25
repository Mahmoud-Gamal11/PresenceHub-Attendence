let currentUser = JSON.parse(localStorage.getItem('currentUser'));

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
        return;
    }

    // Load current profile data
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-role').value = currentUser.role || '';
    document.getElementById('profile-company').value = currentUser.company || '';

    // Profile picture preview (simulate upload)
    const profilePictureInput = document.getElementById('profile-picture');
    const uploadBtn = document.getElementById('upload-picture-btn');
    const preview = document.getElementById('profile-picture-preview');
    const pictureSpinner = document.getElementById('picture-spinner');

    uploadBtn.addEventListener('click', () => {
        pictureSpinner.style.display = 'block';
        const file = profilePictureInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                currentUser.profilePicture = e.target.result; // Save base64 to localStorage
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showNotification('Profile picture updated.', 'success');
                pictureSpinner.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            showNotification('Please select a file.', 'error');
            pictureSpinner.style.display = 'none';
        }
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', e => {
        e.preventDefault();
        const profileSpinner = document.getElementById('profile-spinner');
        profileSpinner.style.display = 'block';
        const email = document.getElementById('profile-email').value.trim();
        const company = document.getElementById('profile-company').value.trim();
        if (!email || !company) {
            showNotification('Please fill all fields.', 'error');
            profileSpinner.style.display = 'none';
            return;
        }
        // Check if email exists for other users
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === email && u.id !== currentUser.id);
        if (existingUser) {
            showNotification('Email already exists.', 'error');
            profileSpinner.style.display = 'none';
            return;
        }
        currentUser.email = email;
        currentUser.company = company;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Update in users list
        users = users.map(u => u.id === currentUser.id ? currentUser : u);
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Profile updated successfully.', 'success');
        profileSpinner.style.display = 'none';
    });

    // Password form
    document.getElementById('password-form').addEventListener('submit', e => {
        e.preventDefault();
        const passwordSpinner = document.getElementById('password-spinner');
        passwordSpinner.style.display = 'block';
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (currentPassword !== currentUser.password) {
            showNotification('Current password is incorrect.', 'error');
            passwordSpinner.style.display = 'none';
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            passwordSpinner.style.display = 'none';
            return;
        }
        if (newPassword.length < 6) {
            showNotification('New password must be at least 6 characters.', 'error');
            passwordSpinner.style.display = 'none';
            return;
        }
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        // Update in users list
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.map(u => u.id === currentUser.id ? currentUser : u);
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Password changed successfully.', 'success');
        document.getElementById('password-form').reset();
        passwordSpinner.style.display = 'none';
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