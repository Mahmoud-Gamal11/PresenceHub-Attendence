// No specific JS for this page, but general script.js is included for notification and logout
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
        window.location.href = 'login.html';
    }, 2000);
}