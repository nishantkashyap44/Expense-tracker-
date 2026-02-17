// ============================================
// TRANSACTIONS - COMPLETE FIXED VERSION
// ============================================

let allTransactions = [];
let filteredTransactions = [];
let currentPage = 1;
let itemsPerPage = 25;
let deleteListenerAdded = false; // ✅ Duplicate listener prevent

document.addEventListener("DOMContentLoaded", async () => {
    loadTheme();
    loadUserInfo();
    setupModal();
    setupTypeSelector();
    setupForm();
    setupThemeToggle();
    setupLogout();
    setupFilterListeners();
    setupDeleteListener(); // ✅ SIRF EK BAAR

    const dateInput = document.querySelector('input[name="transaction_date"]');
    if (dateInput) dateInput.valueAsDate = new Date();

    await loadTransactions();
});

// ============================================
// ✅ DELETE LISTENER - ONLY ONCE
// ============================================
function setupDeleteListener() {
    if (deleteListenerAdded) return;
    const tbody = document.getElementById("transactionsTableBody");
    if (!tbody) return;

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest(".action-btn");
        if (btn && btn.dataset.id) {
            deleteTransaction(btn.dataset.id);
        }
    });

    deleteListenerAdded = true;
}

// ============================================
// LOAD USER INFO
// ============================================
function loadUserInfo() {
    try {
        let user = Storage.get('user');
        if (typeof user === 'string') user = JSON.parse(user);
        if (!user) return;
        const nameEl = document.getElementById('userName');
        const initialsEl = document.getElementById('userInitials');
        if (nameEl) nameEl.textContent = user.name || '';
        if (initialsEl) {
            initialsEl.textContent = (user.name || '')
                .split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2);
        }
    } catch(e) {}
}

// ============================================
// LOAD TRANSACTIONS
// ============================================
async function loadTransactions() {
    try {
        Loading.show();
        const response = await API.getTransactions();

        allTransactions = (response.data || []).sort((a, b) =>
            new Date(b.transaction_date) - new Date(a.transaction_date)
        );

        filteredTransactions = [...allTransactions];
        populateCategories();
        renderPage();
        Loading.hide();

    } catch (error) {
        Loading.hide();
        console.error('Load error:', error);
        Toast.error("Failed to load transactions");
        showEmptyState();
    }
}

// ============================================
// POPULATE CATEGORIES FILTER
// ============================================
function populateCategories() {
    const filterCategory = document.getElementById("filterCategory");
    if (!filterCategory) return;
    const cats = [...new Set(allTransactions.map(t => t.category).filter(Boolean))].sort();
    const curr = filterCategory.value;
    filterCategory.innerHTML = '<option value="">All Categories</option>';
    cats.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterCategory.appendChild(opt);
    });
    if (curr) filterCategory.value = curr;
}

// ============================================
// RENDER PAGE
// ============================================
function renderPage() {
    renderTransactions(filteredTransactions);
    renderPagination(filteredTransactions.length);
}

// ============================================
// ✅ RENDER TRANSACTIONS - NO addEventListener INSIDE
// ============================================
function renderTransactions(data) {
    const tbody = document.getElementById("transactionsTableBody");
    if (!tbody) return;

    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:3rem;color:var(--text-secondary);">
                    <i class="fas fa-inbox" style="font-size:2.5rem;opacity:0.3;display:block;margin-bottom:1rem;"></i>
                    No transactions found
                </td>
            </tr>`;
        return;
    }

    // Paginate
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = data.slice(start, start + itemsPerPage);

    // Group by date
    const grouped = {};
    pageData.forEach(t => {
        const key = formatDateOnly(t.transaction_date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });

    // Build HTML only - no event listeners
    let html = '';
    Object.entries(grouped).forEach(([date, txns]) => {
        html += `
            <tr style="background:var(--bg-primary);border-top:2px solid var(--border-color);">
                <td colspan="6" style="padding:0.6rem 1.5rem;font-weight:600;color:var(--text-secondary);font-size:0.85rem;">
                    📅 ${date}
                </td>
            </tr>`;

        txns.forEach(t => {
            const sign = t.type === 'income' ? '+' : '-';
            const amt = Number(t.amount).toLocaleString('en-IN');
            html += `
                <tr>
                    <td>${formatDateOnly(t.transaction_date)}</td>
                    <td>
                        <span class="type-badge ${t.type}">
                            <i class="fas fa-arrow-${t.type === 'income' ? 'down' : 'up'}"></i>
                            ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        </span>
                    </td>
                    <td>${t.category || '-'}</td>
                    <td>${t.description || '-'}</td>
                    <td class="amount-cell ${t.type}">${sign}₹${amt}</td>
                    <td>
                        <button class="action-btn" data-id="${t.id}" type="button" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });
    });

    tbody.innerHTML = html;
    // ✅ No addEventListener here - it's handled by setupDeleteListener()
}

// ============================================
// PAGINATION
// ============================================
function renderPagination(totalItems) {
    const infoEl = document.getElementById("paginationInfo");
    const ctrlEl = document.getElementById("paginationControls");
    if (!infoEl || !ctrlEl) return;

    if (totalItems === 0) {
        infoEl.textContent = 'No transactions found';
        ctrlEl.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    infoEl.textContent = `Showing ${startItem} to ${endItem} of ${totalItems} transactions`;

    if (totalPages <= 1) { ctrlEl.innerHTML = ''; return; }

    let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i></button>`;

    let startP = Math.max(1, currentPage - 2);
    let endP = Math.min(totalPages, startP + 4);
    if (endP - startP < 4) startP = Math.max(1, endP - 4);

    if (startP > 1) {
        html += `<button class="page-btn" onclick="changePage(1)">1</button>`;
        if (startP > 2) html += `<span style="padding:0 0.4rem;">...</span>`;
    }

    for (let i = startP; i <= endP; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    if (endP < totalPages) {
        if (endP < totalPages - 1) html += `<span style="padding:0 0.4rem;">...</span>`;
        html += `<button class="page-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i></button>`;

    ctrlEl.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPage();
    document.querySelector('.transactions-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// FILTER LISTENERS - ONLY ONCE
// ============================================
function setupFilterListeners() {
    const filterType = document.getElementById("filterType");
    const filterCategory = document.getElementById("filterCategory");
    const filterDateFrom = document.getElementById("filterDateFrom");
    const filterDateTo = document.getElementById("filterDateTo");
    const pageSize = document.getElementById("pageSize");

    function applyFilters() {
        currentPage = 1;
        const typeVal = filterType?.value || '';
        const catVal = filterCategory?.value || '';
        const from = filterDateFrom?.value || '';
        const to = filterDateTo?.value || '';

        filteredTransactions = allTransactions.filter(t => {
            const d = new Date(t.transaction_date).toISOString().split('T')[0];
            return (
                (!typeVal || t.type === typeVal) &&
                (!catVal || t.category === catVal) &&
                (!from || d >= from) &&
                (!to || d <= to)
            );
        });

        renderPage();
    }

    filterType?.addEventListener("change", applyFilters);
    filterCategory?.addEventListener("change", applyFilters);
    filterDateFrom?.addEventListener("change", applyFilters);
    filterDateTo?.addEventListener("change", applyFilters);

    pageSize?.addEventListener("change", (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderPage();
    });
}

// ============================================
// MODAL
// ============================================
function setupModal() {
    const modal = document.getElementById("addTransactionModal");
    const openBtn = document.getElementById("addTransactionBtn");
    const closeBtn = document.getElementById("closeModal");
    if (!modal || !openBtn) return;

    openBtn.addEventListener("click", () => modal.classList.add("active"));
    closeBtn?.addEventListener("click", () => {
        modal.classList.remove("active");
        document.getElementById("transactionForm")?.reset();
    });
    modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
    });
}

// ============================================
// TYPE SELECTOR
// ============================================
function setupTypeSelector() {
    const incomeOpt = document.getElementById("incomeOption");
    const expenseOpt = document.getElementById("expenseOption");

    incomeOpt?.addEventListener("click", e => {
        e.preventDefault();
        incomeOpt.classList.add("active");
        expenseOpt?.classList.remove("active");
        document.querySelector('input[value="income"]').checked = true;
    });

    expenseOpt?.addEventListener("click", e => {
        e.preventDefault();
        expenseOpt.classList.add("active");
        incomeOpt?.classList.remove("active");
        document.querySelector('input[value="expense"]').checked = true;
    });
}

// ============================================
// FORM SUBMIT
// ============================================
function setupForm() {
    const form = document.getElementById("transactionForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = {
            type: fd.get("type"),
            amount: parseFloat(fd.get("amount")),
            category: fd.get("category"),
            description: fd.get("description") || '',
            transaction_date: fd.get("transaction_date")
        };

        if (!payload.type || !payload.amount || !payload.category || !payload.transaction_date) {
            Toast.error("Please fill all required fields");
            return;
        }

        try {
            Loading.show();
            await API.addTransaction(payload);
            Toast.success("✅ Transaction added!");
            document.getElementById("addTransactionModal").classList.remove("active");
            form.reset();
            document.querySelector('input[name="transaction_date"]').valueAsDate = new Date();
            currentPage = 1;
            await loadTransactions();
            Loading.hide();
        } catch (error) {
            Loading.hide();
            Toast.error(error.message || "Failed to add transaction");
        }
    });
}

// ============================================
// DELETE TRANSACTION
// ============================================
async function deleteTransaction(id) {
    if (!confirm("Delete this transaction?")) return;
    try {
        Loading.show();
        await API.deleteTransaction(id);
        Toast.success("Deleted!");
        currentPage = 1;
        await loadTransactions();
        Loading.hide();
    } catch (error) {
        Loading.hide();
        Toast.error("Delete failed");
    }
}

// ============================================
// EMPTY STATE
// ============================================
function showEmptyState() {
    const tbody = document.getElementById("transactionsTableBody");
    if (tbody) tbody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center;padding:3rem;color:var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:1rem;"></i>
                No transactions yet. Add your first transaction!
            </td>
        </tr>`;
}

// ============================================
// THEME & LOGOUT
// ============================================
function loadTheme() {
    if (Storage.get('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}

function setupThemeToggle() {
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        Storage.set('theme', isDark ? 'dark' : 'light');
    });
}

function setupLogout() {
    document.getElementById('logoutBtn')?.addEventListener('click', e => {
        e.preventDefault();
        if (confirm('Logout karna chahte ho?')) {
            localStorage.clear();
            window.location.href = '/login.html';
        }
    });
}

// ============================================
// DATE HELPER
// ============================================
function formatDateOnly(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
}

// Global for onclick in pagination
window.changePage = changePage;