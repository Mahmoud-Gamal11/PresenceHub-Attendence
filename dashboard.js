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

    if (['admin', 'super_admin'].includes(currentUser.role)) {
        document.getElementById('admin-section').classList.remove('d-none');
        loadEmployeeStatus();
    }

    loadCheckIns();

    document.getElementById('check-in-btn').addEventListener('click', () => {
        // Check if already checked in today to prevent multiple check-ins
        const today = new Date().toISOString().split('T')[0];
        const todayCheckIn = checkIns.find(c => 
            c.user_id === currentUser.id && 
            !c.type && 
            new Date(c.timestamp).toISOString().split('T')[0] === today
        );
        if (todayCheckIn) {
            showNotification('You have already checked in today.', 'error');
            return;
        }

        document.getElementById('check-in-spinner').style.display = 'block';
        navigator.geolocation.getCurrentPosition(
            pos => {
                const checkIn = {
                    user_id: currentUser.id,
                    timestamp: new Date().toISOString(),
                    location: {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    }
                };
                checkIns.push(checkIn);
                localStorage.setItem('checkIns', JSON.stringify(checkIns));
                showNotification('Checked in successfully.', 'success');
                loadCheckIns();
                if (['admin', 'super_admin'].includes(currentUser.role)) {
                    loadEmployeeStatus();
                }
                document.getElementById('check-in-spinner').style.display = 'none';
            },
            err => {
                showNotification('Failed to get location. Please enable location services.', 'error');
                document.getElementById('check-in-spinner').style.display = 'none';
            }
        );
    });

    document.getElementById('check-out-btn').addEventListener('click', () => {
        // Check if checked in today without check-out
        const today = new Date().toISOString().split('T')[0];
        const todayCheckIn = checkIns.find(c => 
            c.user_id === currentUser.id && 
            !c.type && 
            new Date(c.timestamp).toISOString().split('T')[0] === today
        );
        if (!todayCheckIn) {
            showNotification('You need to check in first.', 'error');
            return;
        }
        const todayCheckOut = checkIns.find(c => 
            c.user_id === currentUser.id && 
            c.type === 'check-out' && 
            new Date(c.timestamp).toISOString().split('T')[0] === today
        );
        if (todayCheckOut) {
            showNotification('You have already checked out today.', 'error');
            return;
        }

        document.getElementById('check-out-spinner').style.display = 'block';
        navigator.geolocation.getCurrentPosition(
            pos => {
                const checkOut = {
                    user_id: currentUser.id,
                    timestamp: new Date().toISOString(),
                    location: {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude
                    },
                    type: 'check-out'
                };
                checkIns.push(checkOut);
                localStorage.setItem('checkIns', JSON.stringify(checkIns));
                showNotification('Checked out successfully.', 'success');
                loadCheckIns();
                if (['admin', 'super_admin'].includes(currentUser.role)) {
                    loadEmployeeStatus();
                }
                document.getElementById('check-out-spinner').style.display = 'none';
            },
            err => {
                showNotification('Failed to get location. Please enable location services.', 'error');
                document.getElementById('check-out-spinner').style.display = 'none';
            }
        );
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

function loadCheckIns() {
    const tbody = document.getElementById('check-ins');
    tbody.innerHTML = '';
    const userCheckIns = checkIns.filter(c => c.user_id === currentUser.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (userCheckIns.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No check-ins yet.</td></tr>';
    } else {
        userCheckIns.forEach(c => {
            const tr = document.createElement('tr');
            const typeText = c.type ? 'Check Out' : 'Check In';
            tr.innerHTML = `
                <td>${typeText}</td>
                <td>${new Date(c.timestamp).toLocaleDateString()}</td>
                <td>${new Date(c.timestamp).toLocaleTimeString()}</td>
                <td>Lat: ${c.location.lat.toFixed(4)}, Lon: ${c.location.lon.toFixed(4)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

function loadEmployeeStatus() {
    const tbody = document.getElementById('employee-status');
    tbody.innerHTML = '';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const companyUsers = users.filter(u => u.company === currentUser.company);
    if (companyUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No employees found.</td></tr>';
    } else {
        companyUsers.forEach(u => {
            const userCheckIns = checkIns.filter(c => c.user_id === u.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const lastCheckIn = userCheckIns.find(c => !c.type);
            const lastCheckOut = userCheckIns.find(c => c.type === 'check-out');
            const status = !lastCheckIn ? 'Not Checked In' : (lastCheckOut && new Date(lastCheckOut.timestamp) > new Date(lastCheckIn.timestamp) ? 'Checked Out' : 'Checked In');
            const lastCheckInTime = lastCheckIn ? new Date(lastCheckIn.timestamp).toLocaleString() : '-';
            const lastCheckOutTime = lastCheckOut ? new Date(lastCheckOut.timestamp).toLocaleString() : '-';
            let workedTime = '-';
            if (lastCheckIn) {
                const endTime = lastCheckOut ? new Date(lastCheckOut.timestamp) : new Date();
                if (endTime > new Date(lastCheckIn.timestamp)) {
                    const diffMs = endTime - new Date(lastCheckIn.timestamp);
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    workedTime = `${hours}h ${minutes}m`;
                }
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.email}</td>
                <td>${u.role.charAt(0).toUpperCase() + u.role.slice(1)}</td>
                <td>${status}</td>
                <td>${lastCheckInTime}</td>
                <td>${lastCheckOutTime}</td>
                <td>${workedTime}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}