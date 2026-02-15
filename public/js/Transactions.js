let allTransactions = [];

document.addEventListener("DOMContentLoaded", () => {
    loadTransactions();
    setupModal();
    setupForm();
});

async function loadTransactions() {
    try {
        Loading.show();

        const response = await API.getTransactions();

        // IMPORTANT
        allTransactions = response.data || [];

        renderTransactions(allTransactions);

        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error(error);
        Toast.error("Failed to load transactions");
    }
}

function renderTransactions(data) {
    const tbody = document.getElementById("transactionsTableBody");

    if (!data.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:2rem;">
                    No transactions found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(t => `
        <tr>
            <td>${formatDate(t.transaction_date)}</td>
            <td>
                <span class="type-badge ${t.type}">
                    ${t.type}
                </span>
            </td>
            <td>${t.category}</td>
            <td>${t.description || "-"}</td>
            <td class="amount-cell ${t.type}">
                ₹${Number(t.amount).toLocaleString()}
            </td>
            <td>
                <button class="action-btn" onclick="deleteTransaction(${t.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN");
}

function setupModal() {
    const modal = document.getElementById("addTransactionModal");
    const openBtn = document.getElementById("addTransactionBtn");
    const closeBtn = document.getElementById("closeModal");

    openBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

function setupForm() {
    const form = document.getElementById("transactionForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const payload = {
            type: formData.get("type"),
            amount: formData.get("amount"),
            category: formData.get("category"),
            description: formData.get("description"),
            transaction_date: formData.get("transaction_date")
        };

        try {
            Loading.show();

            await API.createTransaction(payload);

            Toast.success("Transaction added");

            document.getElementById("addTransactionModal")
                .classList.remove("active");

            form.reset();
            loadTransactions();

            Loading.hide();
        } catch (error) {
            Loading.hide();
            console.error(error);
            Toast.error("Failed to add transaction");
        }
    });
}

async function deleteTransaction(id) {
    if (!confirm("Delete this transaction?")) return;

    try {
        Loading.show();

        await API.deleteTransaction(id);

        loadTransactions();

        Toast.success("Deleted successfully");

        Loading.hide();
    } catch (error) {
        Loading.hide();
        console.error(error);
        Toast.error("Delete failed");
    }
}