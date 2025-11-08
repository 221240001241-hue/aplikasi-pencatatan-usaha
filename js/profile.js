// Profile page functionality
function initProfile() {
    // Load business info
    const businessName = document.getElementById('businessName');
    const businessType = document.getElementById('businessType');
    
    if (businessName && businessType) {
        businessName.value = db.preferences?.businessName || 'Toko Saya';
        businessType.value = db.preferences?.businessType || 'Toko Retail';
    }
    
    // Save profile button handler
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            db.preferences = {
                ...db.preferences,
                businessName: businessName.value,
                businessType: businessType.value
            };
            saveToStorage();
            
            // Update UI to show success
            showToast('Profil berhasil disimpan');
            
            // Update profile name in header
            const profileNameElements = document.querySelectorAll('.profile-name');
            profileNameElements.forEach(el => el.textContent = businessName.value);
        });
    }
    
    // Reset transactions button handler
    const resetTransBtn = document.getElementById('resetTransactionsBtn');
    if (resetTransBtn) {
        resetTransBtn.addEventListener('click', () => {
            if (confirm('Anda yakin ingin menghapus semua transaksi? Tindakan ini tidak dapat dibatalkan.')) {
                db.transactions = [];
                saveToStorage();
                showToast('Semua transaksi telah dihapus');
            }
        });
    }
    
    // Reset all data button handler
    const resetAllBtn = document.getElementById('resetAllBtn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', () => {
            if (confirm('Anda yakin ingin menghapus semua data? Semua transaksi dan pengaturan akan dihapus. Tindakan ini tidak dapat dibatalkan.')) {
                localStorage.removeItem('labakuData');
                showToast('Semua data telah dihapus');
                setTimeout(() => window.location.reload(), 1500);
            }
        });
    }
}

// Simple toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after animation
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initProfile);