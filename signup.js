document.addEventListener('DOMContentLoaded', () => {
    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر
    document.getElementById('signup-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('signup-spinner').style.display = 'block';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const company = document.getElementById('company').value.trim();
        if (!email || !password || !role || !company) {
            showNotification('Please fill all fields.', 'error');
            document.getElementById('signup-spinner').style.display = 'none';
            return;
        }
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters.', 'error');
            document.getElementById('signup-spinner').style.display = 'none';
            return;
        }
        let users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.find(u => u.email === email)) {
            showNotification('Email already exists.', 'error');
            document.getElementById('signup-spinner').style.display = 'none';
            return;
        }
        const user = {
            id: users.length + 1,
            email,
            password,
            role,
            company
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Sign up successful.', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        document.getElementById('signup-spinner').style.display = 'none';
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