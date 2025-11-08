// Utils: format currency and date
const formatIDR = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number || 0);
};

const formatDateShort = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// Database management with localStorage
const db = {
    transactions: [],
    preferences: { businessName: 'Toko Saya', currency: 'IDR' },
    activePeriod: null // untuk menyimpan periode aktif
};

// Load data from localStorage
function loadFromStorage() {
    const stored = localStorage.getItem('labakuData');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            db.transactions = data.transactions || [];
            db.preferences = data.preferences || { businessName: 'Toko Saya', currency: 'IDR' };
            db.activePeriod = data.activePeriod || getDefaultPeriod(); // load periode yang tersimpan atau default
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }
    // jika tidak ada periode tersimpan, gunakan default
    if (!db.activePeriod) {
        db.activePeriod = getDefaultPeriod();
    }
}

// Save data to localStorage
function saveToStorage() {
    try {
        localStorage.setItem('labakuData', JSON.stringify(db));
    } catch (e) {
        console.error('Error saving data:', e);
        alert('Gagal menyimpan data ke penyimpanan lokal');
    }
}

// Load data on startup
loadFromStorage();

// Render functions
function calculateTotals(transactions = null) {
    // Use provided transactions or all transactions if not provided
    const trans = transactions || db.transactions;
    
    const totals = trans.reduce((acc, t) => {
        if (t.type === 'IN') {
            acc.income += t.amount;
            // Track categories for income
            acc.incomeCategories[t.category] = (acc.incomeCategories[t.category] || 0) + t.amount;
        } else {
            acc.expense += t.amount;
            // Track categories for expense
            acc.expenseCategories[t.category] = (acc.expenseCategories[t.category] || 0) + t.amount;
        }
        return acc;
    }, { 
        income: 0, 
        expense: 0, 
        incomeCategories: {}, 
        expenseCategories: {} 
    });
    
    totals.profit = totals.income - totals.expense;
    
    // Sort categories by amount
    totals.topIncomeCategories = Object.entries(totals.incomeCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
        
    totals.topExpenseCategories = Object.entries(totals.expenseCategories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    return totals;
}

function getDefaultPeriod() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        from: firstDay.toISOString().split('T')[0],
        to: lastDay.toISOString().split('T')[0]
    };
}

function filterTransactionsByPeriod(from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return db.transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= fromDate && transDate <= toDate;
    });
}

function renderProfit() {
    // Get period elements
    const fromEl = document.getElementById('periodFrom') || document.getElementById('recapFrom');
    const toEl = document.getElementById('periodTo') || document.getElementById('recapTo');
    
    // Set default period if not set
    const defaultPeriod = getDefaultPeriod();
    if (fromEl && !fromEl.value) fromEl.value = defaultPeriod.from;
    if (toEl && !toEl.value) toEl.value = defaultPeriod.to;
    
    // Get transactions for the period
    let transactions = db.transactions;
    if (fromEl && toEl) {
        transactions = filterTransactionsByPeriod(fromEl.value, toEl.value);
    }
    
    // Calculate totals
    const totals = calculateTotals(transactions);
    
    // Update amounts on home page
    const profitEl = document.getElementById('profitAmount');
    const incomeEl = document.getElementById('periodIncome');
    const expenseEl = document.getElementById('periodExpense');
    
    if (profitEl) profitEl.textContent = formatIDR(totals.profit);
    if (incomeEl) incomeEl.textContent = formatIDR(totals.income);
    if (expenseEl) expenseEl.textContent = formatIDR(totals.expense);
    
    // Update amounts on recap page
    const recapIncomeEl = document.getElementById('recapIncome');
    const recapExpenseEl = document.getElementById('recapExpense');
    const recapProfitEl = document.getElementById('recapProfit');
    
    if (recapIncomeEl) recapIncomeEl.textContent = formatIDR(totals.income);
    if (recapExpenseEl) recapExpenseEl.textContent = formatIDR(totals.expense);
    if (recapProfitEl) recapProfitEl.textContent = formatIDR(totals.profit);
    
    // Update combined category table on recap page (Kategori Rekap)
    const recapCats = document.getElementById('recapCategories');
    if (recapCats) {
        // totals.incomeCategories and totals.expenseCategories are maps
        const incomeMap = totals.incomeCategories || {};
        const expenseMap = totals.expenseCategories || {};
        const cats = new Set([ ...Object.keys(incomeMap), ...Object.keys(expenseMap) ]);
        const rows = Array.from(cats).map(cat => ({
            cat,
            inAmt: incomeMap[cat] || 0,
            outAmt: expenseMap[cat] || 0,
            total: (incomeMap[cat] || 0) + (expenseMap[cat] || 0)
        })).sort((a,b) => b.total - a.total);

        if (rows.length === 0) {
            recapCats.innerHTML = '<tr class="empty-state"><td colspan="3">Belum ada kategori</td></tr>';
        } else {
            recapCats.innerHTML = rows.map(r => `
                <tr>
                    <td>${r.cat}</td>
                    <td class="amount income">${formatIDR(r.inAmt)}</td>
                    <td class="amount expense">${formatIDR(r.outAmt)}</td>
                </tr>
            `).join('');
        }
    }
}

// Render statistik per-hari untuk periode yang dipilih
function renderPeriodStats() {
    const fromEl = document.getElementById('periodFrom');
    const toEl = document.getElementById('periodTo');
    const container = document.getElementById('periodChart');
    const incomeEl = document.getElementById('periodIncome');
    const expenseEl = document.getElementById('periodExpense');
    const profitEl = document.getElementById('profitAmount');
    
    if (!fromEl || !toEl) {
        // Set default period to current month if not set
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        if (fromEl) fromEl.value = firstDay.toISOString().split('T')[0];
        if (toEl) toEl.value = lastDay.toISOString().split('T')[0];
    }
    
    const from = new Date(fromEl?.value || new Date().toISOString().slice(0,10));
    const to = new Date(toEl?.value || new Date().toISOString().slice(0,10));
    
    // normalize to midnight
    from.setHours(0,0,0,0);
    to.setHours(23,59,59,999);
    
    if (to < from) {
        if (container) container.innerHTML = '<div class="meta">Periode tidak valid</div>';
        return;
    }

    // build list of dates between
    const days = [];
    for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1)) {
        days.push(new Date(d));
    }

    // compute totals per day
    const dayTotals = days.map(day => {
        const key = day.toISOString().slice(0,10);
        const totals = db.transactions.filter(t => t.date === key).reduce((acc, t) => {
            if (t.type === 'IN') acc.in += t.amount; else acc.out += t.amount;
            return acc;
        }, { in: 0, out: 0 });
        return { date: key, in: totals.in, out: totals.out };
    });

    const totalIn = dayTotals.reduce((s, d) => s + d.in, 0);
    const totalOut = dayTotals.reduce((s, d) => s + d.out, 0);
    if (incomeEl) incomeEl.textContent = formatIDR(totalIn);
    if (expenseEl) expenseEl.textContent = formatIDR(totalOut);

    // render simple bar chart (max scaling) if container exists
    if (container) {
        const maxVal = Math.max(1, ...dayTotals.map(d => Math.max(d.in, d.out)));
        container.innerHTML = '';
        dayTotals.forEach(d => {
            const col = document.createElement('div');
            col.className = 'day-col';
            const val = Math.max(d.in, d.out);
            const hPercent = Math.round((val / maxVal) * 100);
            const bar = document.createElement('div');
            bar.className = 'day-bar';
            bar.style.height = (hPercent === 0 ? 6 : (hPercent + 8)) + 'px';
            bar.title = `${d.date}\nPemasukan: ${formatIDR(d.in)}\nPengeluaran: ${formatIDR(d.out)}`;
            const label = document.createElement('div');
            label.className = 'day-label';
            label.textContent = new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit' });
            col.appendChild(bar);
            col.appendChild(label);
            container.appendChild(col);
        });
    }
}

// Filter transactions by period
function filterTransactionsByPeriod(from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    
    return db.transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= fromDate && transDate <= toDate;
    });
}

// Status clock
function updateStatusClock() {
    // update only center clock (notch) per design
    const cT = document.getElementById('centerTime');
    const cD = document.getElementById('centerDate');
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    if (cT) cT.textContent = `${hh}:${mm}`;
    if (cD) cD.textContent = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function renderRecent() {
    const container = document.getElementById('recentList');
    if (!container) return;
    container.innerHTML = '';

    // Determine active period (use stored activePeriod if present)
    const active = db.activePeriod || (() => {
        const def = getDefaultPeriod(); return { from: def.from, to: def.to };
    })();

    // Filter transactions by active period
    const periodFiltered = (db.transactions || []).filter(t => {
        try {
            const td = new Date(t.date);
            const f = new Date(active.from); f.setHours(0,0,0,0);
            const to = new Date(active.to); to.setHours(23,59,59,999);
            return td >= f && td <= to;
        } catch (e) { return false; }
    });

    if (!periodFiltered || periodFiltered.length === 0) {
        // Show empty state
        container.innerHTML = `
            <div class="empty-state">
                <div style="margin:24px 0;text-align:center;color:var(--text-secondary)">
                    <i data-feather="inbox" style="width:48px;height:48px;opacity:0.5;margin-bottom:12px"></i>
                    <p>Belum ada transaksi</p>
                    <p style="font-size:13px;margin-top:4px">Tambahkan transaksi pertama Anda</p>
                </div>
            </div>
        `;
        if (window.feather) feather.replace();
        return;
    }

    // Sort transactions by date (newest first) and take last 5 of the filtered set
    const recentTransactions = periodFiltered
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentTransactions.forEach(t => {
        const item = document.createElement('div');
        item.className = `list-item ${t.type === 'IN' ? 'income' : 'expense'}`;
        item.innerHTML = `
            <div>
                <strong>${t.category}</strong>
                <div class="meta">${formatDateShort(t.date)} • ${t.account || '-'} </div>
            </div>
            <div style="text-align:right">
                <div style="font-weight:700">
                    <span style="color:${t.type === 'IN' ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ${t.type === 'IN' ? '+' : '-'} ${formatIDR(t.amount)}
                    </span>
                </div>
                <div class="meta">${t.note || '-'}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Export CSV with period filtering
function exportCSV(fromDate = null, toDate = null, typeFilter = null) {
    try {
        let transactions = db.transactions;
        
        // Filter by period if dates provided
        if (fromDate && toDate) {
            transactions = filterTransactionsByPeriod(fromDate, toDate);
        }

        // Filter by type if requested (typeFilter: 'IN' | 'OUT')
        if (typeFilter === 'IN' || typeFilter === 'OUT') {
            transactions = transactions.filter(t => t.type === typeFilter);
        }

        // CSV Headers
        const headers = [
            'ID',
            'Tanggal',
            'Tipe Transaksi',
            'Kategori',
            'Akun',
            'Nominal (Rp)',
            'Catatan',
            'Waktu Export'
        ];

        const rows = [headers];

        // Add data rows
        transactions.forEach(t => {
            rows.push([
                t.id,
                formatDateShort(t.date),
                t.type === 'IN' ? 'Pemasukan' : 'Pengeluaran',
                t.category,
                t.account || '-',
                formatIDR(t.amount).replace('Rp\u00A0', ''), // Remove Rp prefix
                t.note || '-',
                new Date().toLocaleString('id-ID')
            ]);
        });

        // Add summary row
        const totalIn = transactions.reduce((sum, t) => t.type === 'IN' ? sum + t.amount : sum, 0);
        const totalOut = transactions.reduce((sum, t) => t.type === 'OUT' ? sum + t.amount : sum, 0);
        
        rows.push([]);
        rows.push(['Ringkasan']);
        rows.push(['Total Pemasukan', '', '', '', '', formatIDR(totalIn).replace('Rp\u00A0', '')]);
        rows.push(['Total Pengeluaran', '', '', '', '', formatIDR(totalOut).replace('Rp\u00A0', '')]);
        rows.push(['Laba Bersih', '', '', '', '', formatIDR(totalIn - totalOut).replace('Rp\u00A0', '')]);

        // Convert to CSV string with proper escaping
        const csv = rows.map(row => 
            row.map(cell => 
                `"${String(cell).replace(/"/g, '""')}"`
            ).join(',')
        ).join('\n');

        // Add BOM for Excel compatibility
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `labaku-export-${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        alert('Data berhasil diekspor ke CSV');
    } catch (e) {
        console.error('Error exporting CSV:', e);
        alert('Gagal mengekspor data: ' + e.message);
    }
}

// Backup (download JSON)
function backupData() {
    try {
        const dataToBackup = {
            transactions: db.transactions,
            preferences: db.preferences,
            version: '1.0.0',
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `labaku-backup-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert('Backup data berhasil dibuat');
    } catch (e) {
        console.error('Error creating backup:', e);
        alert('Gagal membuat backup: ' + e.message);
    }
}

// Restore (upload JSON)
function restoreDataFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            // Validate backup format
            if (parsed.transactions && Array.isArray(parsed.transactions)) {
                if (confirm('Ini akan menggantikan semua data yang ada. Lanjutkan?')) {
                    db.transactions = parsed.transactions;
                    if (parsed.preferences) {
                        db.preferences = parsed.preferences;
                    }
                    saveToStorage();
                    renderAll();
                    alert('Data berhasil dipulihkan');
                }
            } else {
                alert('Format file backup tidak valid');
            }
        } catch(e) {
            console.error('Error restoring data:', e);
            alert('Gagal membaca file: ' + e.message);
        }
    };
    reader.readAsText(file);
}

// Modal control
function openModal() {
    // Populate modal date inputs with current active period
    const period = db.activePeriod || getDefaultPeriod();
    const fromInput = document.getElementById('fromDate');
    const toInput = document.getElementById('toDate');
    if (fromInput) fromInput.value = period.from;
    if (toInput) toInput.value = period.to;
    const m = document.getElementById('modalBackdrop');
    if (m) m.style.display = 'flex';
}
function closeModal() {
    const m = document.getElementById('modalBackdrop');
    if (m) m.style.display = 'none';
}

function renderAll() {
    // Load data first if needed
    if (!db.transactions) {
        loadFromStorage();
    }
    
    // Render all components
    renderProfit();
    renderPeriodStats();
    renderRecent();
    
    // Update recap stats if we're on the recap page
    const recapFrom = document.getElementById('recapFrom');
    const recapTo = document.getElementById('recapTo');
    if (recapFrom && recapTo) {
        updateRecapStats();
    }
    
    // Update feather icons if available
    if (window.feather) {
        feather.replace();
    }
}

// Form validation helper used by transaction-form.html
function validateForm(form) {
    const amount = form.querySelector('input[name="amount"]') || form.querySelector('#amount');
    const category = form.querySelector('select[name="category"]') || form.querySelector('#category');
    const date = form.querySelector('input[name="date"]') || form.querySelector('#date');
    const account = form.querySelector('select[name="account"]') || form.querySelector('#account');
    
    let isValid = true;
    let errors = [];

    // Validate amount
    if (!amount || !amount.value) {
        errors.push('Nominal transaksi harus diisi');
        isValid = false;
    } else if (parseInt(amount.value) <= 0) {
        errors.push('Nominal transaksi harus lebih dari 0');
        isValid = false;
    }

    // Validate category
    if (!category || !category.value) {
        errors.push('Kategori harus dipilih');
        isValid = false;
    }

    // Validate date
    if (!date || !date.value) {
        errors.push('Tanggal harus diisi');
        isValid = false;
    } else {
        const selectedDate = new Date(date.value);
        const today = new Date();
        if (selectedDate > today) {
            errors.push('Tanggal tidak boleh lebih dari hari ini');
            isValid = false;
        }
    }

    // Show errors if any
    if (!isValid) {
        alert('Mohon perbaiki:\n' + errors.join('\n'));
        return false;
    }

    return true;
}

// Navigation active state
function setActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => {
        const href = i.getAttribute('href') || '';
        const base = href.split('?')[0];
        if (base === current) i.classList.add('active');
    });
}

// Update recap page stats
function updateRecapStats() {
    const fromInput = document.getElementById('recapFrom');
    const toInput = document.getElementById('recapTo');
    
    if (!fromInput || !toInput) return;
    
    // Simpan periode baru ke storage saat recap diupdate
    db.activePeriod = { from: fromInput.value, to: toInput.value };
    saveToStorage();
    
    const transactions = filterTransactionsByPeriod(fromInput.value, toInput.value);
    const totals = calculateTotals(transactions);
    
    // Update totals
    const recapIncomeEl = document.getElementById('recapIncome');
    const recapExpenseEl = document.getElementById('recapExpense');
    const recapProfitEl = document.getElementById('recapProfit');
    
    if (recapIncomeEl) recapIncomeEl.textContent = formatIDR(totals.income);
    if (recapExpenseEl) recapExpenseEl.textContent = formatIDR(totals.expense);
    if (recapProfitEl) recapProfitEl.textContent = formatIDR(totals.profit);
    
    // Update top categories
    updateTopCategories(transactions);
    
    // Render transactions table according to selected type filter
    const typeRadio = document.querySelector('input[name="recapType"]:checked');
    const typeVal = typeRadio ? typeRadio.value : 'all';
    renderRecapTransactions(fromInput.value, toInput.value, typeVal);

    // Update compact recap period display (if present)
    updateRecapPeriodDisplay(fromInput.value, toInput.value);
    // Update recent list to follow same period
    try { renderRecent(); } catch (e) { /* ignore */ }
}

// Update compact period text shown on recap page (format like home)
function updateRecapPeriodDisplay(from, to) {
    const el = document.getElementById('recapPeriodText');
    if (!el) return;
    try {
        const f = new Date(from);
        const t = new Date(to);
        const opts = { day: '2-digit', month: 'short' };
        el.textContent = `${f.toLocaleDateString('id-ID', opts)} – ${t.toLocaleDateString('id-ID', opts)}`;
    } catch (e) {
        el.textContent = `${from || '-'} – ${to || '-'}`;
    }
}

// Render transactions table in recap
function renderRecapTransactions(from, to, type = 'all') {
    const tbody = document.getElementById('recapTransactions');
    if (!tbody) return;
    tbody.innerHTML = '';

    let transactions = filterTransactionsByPeriod(from, to);
    if (type === 'IN' || type === 'OUT') transactions = transactions.filter(t => t.type === type);

    if (!transactions.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Tidak ada transaksi pada periode ini</td></tr>`;
        return;
    }

    // Sort by date desc
    transactions.sort((a,b) => new Date(b.date) - new Date(a.date));

    transactions.forEach(t => {
        const tr = document.createElement('tr');
        tr.className = t.type === 'IN' ? 'income' : 'expense';
        tr.innerHTML = `
            <td>${formatDateShort(t.date)}</td>
            <td>${t.category}</td>
            <td>${t.account || '-'}</td>
            <td style="text-align:right">${t.type === 'IN' ? '+' : '-'} ${formatIDR(t.amount)}</td>
            <td>${t.note || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Calculate and display top categories
function updateTopCategories(transactions) {
    // Build combined category table for recap
    const incomeCategories = transactions
        .filter(t => t.type === 'IN')
        .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

    const expenseCategories = transactions
        .filter(t => t.type === 'OUT')
        .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {});

    const allCats = new Set([ ...Object.keys(incomeCategories), ...Object.keys(expenseCategories) ]);
    const rows = Array.from(allCats).map(cat => ({
        cat,
        inAmt: incomeCategories[cat] || 0,
        outAmt: expenseCategories[cat] || 0,
        total: (incomeCategories[cat] || 0) + (expenseCategories[cat] || 0)
    })).sort((a,b) => b.total - a.total);

    const recapCats = document.getElementById('recapCategories');
    if (recapCats) {
        if (!rows.length) {
            recapCats.innerHTML = '<tr class="empty-state"><td colspan="3">Belum ada kategori</td></tr>';
        } else {
            recapCats.innerHTML = rows.map(r => `
                <tr>
                    <td>${r.cat}</td>
                    <td class="amount income">${formatIDR(r.inAmt)}</td>
                    <td class="amount expense">${formatIDR(r.outAmt)}</td>
                </tr>
            `).join('');
        }
    }
}

// Print recap (opens printable window)
function printRecap() {
    try {
        const fromInput = document.getElementById('recapFrom');
        const toInput = document.getElementById('recapTo');
        const from = fromInput ? fromInput.value : null;
        const to = toInput ? toInput.value : null;
    let transactions = (from && to) ? filterTransactionsByPeriod(from, to) : db.transactions;
        // apply type filter if selected on recap page
        const typeRadio = document.querySelector('input[name="recapType"]:checked');
        const typeVal = typeRadio ? typeRadio.value : 'all';
        if (typeVal === 'IN' || typeVal === 'OUT') {
            transactions = transactions.filter(t => t.type === typeVal);
        }
        const totals = calculateTotals(transactions);

        let html = `<!doctype html><html><head><meta charset="utf-8"><title>Rekap ${from || ''} - ${to || ''}</title>`;
        html += `<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px}h2{margin-top:0}table{width:100%;border-collapse:collapse;margin-bottom:16px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f6f6f6}</style>`;
        html += `</head><body>`;
        html += `<h2>Rekap ${from || ''} – ${to || ''}</h2>`;
        html += `<p><strong>Total Pemasukan:</strong> ${formatIDR(totals.income)}</p>`;
        html += `<p><strong>Total Pengeluaran:</strong> ${formatIDR(totals.expense)}</p>`;
        html += `<p><strong>Laba Bersih:</strong> ${formatIDR(totals.profit)}</p>`;

        html += `<h3>Pemasukan (Top)</h3>`;
        html += `<table><thead><tr><th>Kategori</th><th style="width:160px">Nominal</th></tr></thead><tbody>`;
        if (totals.topIncomeCategories && totals.topIncomeCategories.length) {
            totals.topIncomeCategories.forEach(([cat, amt]) => {
                html += `<tr><td>${cat}</td><td>${formatIDR(amt)}</td></tr>`;
            });
        } else {
            html += `<tr><td colspan="2">Tidak ada pemasukan</td></tr>`;
        }
        html += `</tbody></table>`;

        html += `<h3>Pengeluaran (Top)</h3>`;
        html += `<table><thead><tr><th>Kategori</th><th style="width:160px">Nominal</th></tr></thead><tbody>`;
        if (totals.topExpenseCategories && totals.topExpenseCategories.length) {
            totals.topExpenseCategories.forEach(([cat, amt]) => {
                html += `<tr><td>${cat}</td><td>${formatIDR(amt)}</td></tr>`;
            });
        } else {
            html += `<tr><td colspan="2">Tidak ada pengeluaran</td></tr>`;
        }
        html += `</tbody></table>`;

        html += `</body></html>`;

        const w = window.open('', '_blank');
        if (!w) { alert('Gagal membuka jendela cetak. Periksa popup blocker.'); return; }
        w.document.write(html);
        w.document.close();
        w.focus();
        // give browser a moment to render
        setTimeout(() => { w.print(); /* w.close(); */ }, 300);
    } catch (e) {
        console.error('printRecap error', e);
        alert('Gagal menyiapkan cetak: ' + e.message);
    }
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();

    // Initialize recap period inputs (if on recap page)
    const recapFrom = document.getElementById('recapFrom');
    const recapTo = document.getElementById('recapTo');
    if (recapFrom && recapTo) {
        // Gunakan periode dari storage
        const period = db.activePeriod || getDefaultPeriod();
        recapFrom.value = period.from;
        recapTo.value = period.to;
        // Update teks periode
        updateRecapPeriodDisplay(period.from, period.to);
        recapFrom.addEventListener('change', updateRecapStats);
        recapTo.addEventListener('change', updateRecapStats);
        // recap type filter radios
        document.querySelectorAll('input[name="recapType"]').forEach(r => r.addEventListener('change', updateRecapStats));
    }

    // Initialize hidden period inputs (home) and compact display
    const pf = document.getElementById('periodFrom');
    const pt = document.getElementById('periodTo');
    const pText = document.getElementById('periodText');
    const periodDisplay = document.getElementById('periodDisplay');
    const openCalendarBtn = document.getElementById('openCalendarBtn');

    // Gunakan periode dari storage atau default jika belum ada
    const period = db.activePeriod || getDefaultPeriod();
    if (pf) pf.value = period.from;
    if (pt) pt.value = period.to;

    if (pText && pf && pt) {
        try {
            const f = new Date(pf.value);
            const t = new Date(pt.value);
            const opts = { day: '2-digit', month: 'short' };
            pText.textContent = `${f.toLocaleDateString('id-ID', opts)} – ${t.toLocaleDateString('id-ID', opts)}`;
        } catch (e) {
            pText.textContent = `${pf.value} – ${pt.value}`;
        }
    }

    // Ensure recap hidden inputs/text reflect current home period on load
    const rFromInit = document.getElementById('recapFrom');
    const rToInit = document.getElementById('recapTo');
    const rTextInit = document.getElementById('recapPeriodText');
    if (rFromInit && rToInit && pf && pt) {
        rFromInit.value = pf.value;
        rToInit.value = pt.value;
        if (rTextInit && pText) rTextInit.textContent = pText.textContent;
        try { updateRecapStats(); } catch (e) { /* ignore if recap not on this page */ }
    }

    // wire period change handlers for home and sync to recap if present
    if (pf && pt) {
        const syncToRecap = () => {
            renderPeriodStats();
            renderProfit();
            // simpan periode ke storage dan update recent
            db.activePeriod = { from: pf.value, to: pt.value };
            saveToStorage();
            const rFrom = document.getElementById('recapFrom');
            const rTo = document.getElementById('recapTo');
            const rText = document.getElementById('recapPeriodText');
            if (rFrom && rTo) {
                rFrom.value = pf.value;
                rTo.value = pt.value;
                try {
                    const f = new Date(pf.value);
                    const t = new Date(pt.value);
                    const opts = { day: '2-digit', month: 'short' };
                    if (rText) rText.textContent = `${f.toLocaleDateString('id-ID', opts)} – ${t.toLocaleDateString('id-ID', opts)}`;
                } catch (e) {
                    if (rText) rText.textContent = `${pf.value} – ${pt.value}`;
                }
                try { updateRecapStats(); } catch (e) { /* ignore if recap not on this page */ }
                try { renderRecent(); } catch (e) { /* ignore if recent not present */ }
            }
        };
        pf.addEventListener('change', syncToRecap);
        pt.addEventListener('change', syncToRecap);
    }

    if (periodDisplay) periodDisplay.addEventListener('click', openModal);
    // also wire recap compact period (if present) to open the same modal
    const recapPeriodDisplay = document.getElementById('recapPeriodDisplay');
    if (recapPeriodDisplay) recapPeriodDisplay.addEventListener('click', openModal);
    if (openCalendarBtn) openCalendarBtn.addEventListener('click', openModal);

    // calendar modal
    const closeModalBtn = document.getElementById('closeModal');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    const applyPeriod = document.getElementById('applyPeriod');
    if (applyPeriod) applyPeriod.addEventListener('click', () => {
        const fromInput = document.getElementById('fromDate');
        const toInput = document.getElementById('toDate');
        const pFrom = document.getElementById('periodFrom');
        const pTo = document.getElementById('periodTo');
        const pText = document.getElementById('periodText');
        if (fromInput && toInput && pFrom && pTo) {
            // Simpan periode baru ke storage saat Apply di modal
            db.activePeriod = { from: fromInput.value, to: toInput.value };
            saveToStorage();
            
            pFrom.value = fromInput.value;
            pTo.value = toInput.value;
            try {
                const f = new Date(fromInput.value);
                const t = new Date(toInput.value);
                const opts = { day: '2-digit', month: 'short' };
                pText.textContent = `${f.toLocaleDateString('id-ID', opts)} – ${t.toLocaleDateString('id-ID', opts)}`;
            } catch (e) {
                pText.textContent = `${fromInput.value} – ${toInput.value}`;
            }
            renderPeriodStats();
            renderProfit();
            try { renderRecent(); } catch (e) { /* ignore */ }
        }

        // also update recap hidden inputs and compact text if recap exists
        const rFrom = document.getElementById('recapFrom');
        const rTo = document.getElementById('recapTo');
        const rText = document.getElementById('recapPeriodText');
        if (fromInput && toInput && rFrom && rTo) {
            rFrom.value = fromInput.value;
            rTo.value = toInput.value;
            try {
                const f2 = new Date(fromInput.value);
                const t2 = new Date(toInput.value);
                const opts2 = { day: '2-digit', month: 'short' };
                if (rText) rText.textContent = `${f2.toLocaleDateString('id-ID', opts2)} – ${t2.toLocaleDateString('id-ID', opts2)}`;
            } catch (err) {
                if (rText) rText.textContent = `${fromInput.value} – ${toInput.value}`;
            }
            // refresh recap view
            try { updateRecapStats(); } catch (e) { /* ignore if not present */ }
        }
        closeModal();
    });

    // FAB
    const fab = document.getElementById('fabBtn');
    if (fab) {
        fab.addEventListener('click', () => {
            const qa = document.getElementById('quickActions');
            if (qa) qa.style.display = qa.style.display === 'none' ? 'flex' : 'none';
        });
    }
    // quick actions
    const qi = document.getElementById('quickIncome');
    if (qi) qi.addEventListener('click', () => window.location.href = 'transaction-form.html?type=income');
    const qe = document.getElementById('quickExpense');
    if (qe) qe.addEventListener('click', () => window.location.href = 'transaction-form.html?type=expense');

    // expose export/backup to buttons if present
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) exportBtn.addEventListener('click', () => {
        // prefer recap period if available, otherwise home period
        const rFrom = document.getElementById('recapFrom');
        const rTo = document.getElementById('recapTo');
        const typeRadio = document.querySelector('input[name="recapType"]:checked');
        const typeVal = typeRadio ? (typeRadio.value === 'all' ? null : typeRadio.value) : null;
        if (rFrom && rTo) exportCSV(rFrom.value, rTo.value, typeVal); else if (pf && pt) exportCSV(pf.value, pt.value, typeVal); else exportCSV(null, null, typeVal);
    });
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) backupBtn.addEventListener('click', backupData);
    const restoreInput = document.getElementById('restoreInput');
    if (restoreInput) restoreInput.addEventListener('change', (e) => restoreDataFromFile(e.target.files[0]));

    // set today's date for date inputs (modal inputs etc.)
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) input.value = new Date().toISOString().split('T')[0];
    });

    // ensure feather icons are rendered (calendar icon etc.) after DOM wiring
    if (window.feather) {
        try { feather.replace(); } catch (e) { console.warn('feather.replace failed', e); }
    }

    // Bottom navigation: modern press/pulse feedback (adds/removes CSS classes)
    try {
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        if (navItems && navItems.length) {
            navItems.forEach(item => {
                item.addEventListener('pointerdown', (e) => {
                    item.classList.add('pressed');
                    item.classList.add('pulse');
                    window.setTimeout(() => item.classList.remove('pulse'), 300);
                });

                const clearPressed = () => item.classList.remove('pressed');
                item.addEventListener('pointerup', clearPressed);
                item.addEventListener('pointercancel', clearPressed);
                item.addEventListener('pointerleave', clearPressed);
            });
        }
    } catch (e) { console.warn('Nav press handler init failed', e); }

    // start status clock
    updateStatusClock();
    setInterval(updateStatusClock, 1000);

    // Now that inputs and listeners are initialized, render everything
    renderAll();
    if (window.feather) { feather.replace(); }
});

// For other pages: helper to add transaction (used by form)
function addTransaction(obj) {
    obj.id = (db.transactions.length ? Math.max(...db.transactions.map(t => t.id)) : 0) + 1;
    db.transactions.push(obj);
    saveToStorage(); // Save after adding
    renderAll();
}

// Make functions available globally for inline handlers
window.formatIDR = formatIDR;
window.validateForm = validateForm;
window.addTransaction = addTransaction;
window.exportCSV = exportCSV;
window.backupData = backupData;
window.restoreDataFromFile = restoreDataFromFile;