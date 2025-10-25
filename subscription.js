let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let subscription = JSON.parse(localStorage.getItem('subscription')) || { plan: 'basic', startDate: new Date().toISOString() };

document.addEventListener('DOMContentLoaded', () => {
    if (!currentUser) {
        showNotification('Please login.', 'error');
        setTimeout(() => window.location.href = 'home.html', 1000);
        return;
    }

    // مش هناك أي كود هنا يغير styles أو يستخدم GSAP للعناصر

    loadCurrentPlan();
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

function selectPlan(plan) {
    subscription = { plan, startDate: new Date().toISOString() };
    localStorage.setItem('subscription', JSON.stringify(subscription));
    showNotification(`Successfully upgraded to ${plan} plan!`, 'success');
    loadCurrentPlan();
}

function upgradePlan() {
    const plans = { basic: 'pro', pro: 'enterprise', enterprise: 'enterprise' };
    const nextPlan = plans[subscription.plan];
    selectPlan(nextPlan);
}

function loadCurrentPlan() {
    const planNames = {
        basic: 'Basic - Free',
        pro: 'Pro - $29/month',
        enterprise: 'Enterprise - $99/month'
    };
    const details = {
        basic: 'Free plan - Up to 10 employees',
        pro: 'Pro plan - Up to 100 employees with advanced features',
        enterprise: 'Enterprise plan - Unlimited employees & custom features'
    };
    
    document.getElementById('plan-name').textContent = planNames[subscription.plan];
    document.getElementById('plan-details').textContent = details[subscription.plan];
    
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (subscription.plan === 'enterprise') {
        upgradeBtn.textContent = 'Enterprise Plan';
        upgradeBtn.className = 'btn btn-success';
        upgradeBtn.disabled = true;
    } else {
        upgradeBtn.textContent = `Upgrade to ${subscription.plan === 'basic' ? 'Pro' : 'Enterprise'}`;
    }
}