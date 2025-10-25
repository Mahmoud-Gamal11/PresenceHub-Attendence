let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let integrations = JSON.parse(localStorage.getItem('integrations')) || [];

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => window.location.href = 'home.html', 1000);
        return;
    }

    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر

    loadConnectedIntegrations();
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

function toggleIntegration(type) {
    const existing = integrations.find(i => i.type === type);
    if (existing) {
        integrations = integrations.filter(i => i.type !== type);
        showNotification(`${type} integration disconnected.`, 'error');
    } else {
        integrations.push({ type, status: 'connected', date: new Date().toISOString() });
        showNotification(`${type} integration connected successfully!`, 'success');
    }
    localStorage.setItem('integrations', JSON.stringify(integrations));
    loadConnectedIntegrations();
    updateIntegrationUI(type);
}

function updateIntegrationUI(type) {
    const button = document.querySelector(`[onclick="toggleIntegration('${type}')"]`);
    const status = button.nextElementSibling;
    const isConnected = integrations.find(i => i.type === type);
    button.textContent = isConnected ? 'Disconnect' : 'Connect';
    status.classList.toggle('d-none', !isConnected);
}

function loadConnectedIntegrations() {
    const container = document.getElementById('connected-integrations');
    if (integrations.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">No integrations connected yet. Click "Connect" above to get started!</p></div>';
        return;
    }
    container.innerHTML = integrations.map(i => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card shadow-sm">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="card-title">${i.type.charAt(0).toUpperCase() + i.type.slice(1)}</h6>
                        <small class="text-muted">Connected: ${new Date(i.date).toLocaleDateString()}</small>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="toggleIntegration('${i.type}')">Disconnect</button>
                </div>
            </div>
        </div>
    `).join('');
}