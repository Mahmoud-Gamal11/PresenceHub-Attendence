document.addEventListener('DOMContentLoaded', () => {
    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر الأساسية، بس الـ animations للـ 404

    gsap.from('.error-icon', { scale: 0, duration: 1, ease: 'back.out(1.7)' });
    gsap.from('h1', { opacity: 0, y: 50, duration: 1, delay: 0.5 });
    gsap.from('h2', { opacity: 0, y: 50, duration: 1, delay: 0.7 });
    gsap.from('p', { opacity: 0, y: 30, duration: 1, delay: 0.9 });
    gsap.from('.btn', { opacity: 0, scale: 0.8, duration: 1, delay: 1.1 });
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
        window.location.href = 'login.html';
    }, 2000);
}