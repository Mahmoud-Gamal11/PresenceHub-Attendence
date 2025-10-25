document.addEventListener('DOMContentLoaded', () => {
    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر
    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        document.getElementById('login-spinner').style.display = 'block';
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful.', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showNotification('Invalid email or password.', 'error');
        }
        document.getElementById('login-spinner').style.display = 'none';
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