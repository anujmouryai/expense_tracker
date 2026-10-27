
const expenseForm = document.getElementById("expense-form");
const titleInput = document.getElementById("expense-title");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const dateInput = document.getElementById("expense-date");

const totalExpenses = document.getElementById("total-expenses");
const totalCount = document.getElementById("total-count");
const expenseList = document.getElementById("expense-list");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const emptyMessage = document.getElementById("empty-message");

// Load saved expenses from localStorage
let expenses = [];

try {
    const savedExpenses = JSON.parse(
        localStorage.getItem("expenses") || "[]"
    );

    if (Array.isArray(savedExpenses)) {
        expenses = savedExpenses.filter(expense =>
            expense &&
            Number.isFinite(expense.id) &&
            typeof expense.title === "string" &&
            Number.isFinite(expense.amount) &&
            expense.amount > 0 &&
            typeof expense.category === "string" &&
            typeof expense.date === "string"
        );
    }
} catch (error) {
    console.error("Could not load saved expenses:", error);
}

// Set today's date by default
dateInput.value = new Date().toLocaleDateString("en-CA");

// Save expenses
function saveExpenses() {
    try {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    } catch (error) {
        alert("Unable to save expenses. Check browser storage.");
        console.error(error);
    }
}

// Add a new expense
expenseForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !category || !date) {
        alert("Please fill in all fields.");
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter an amount greater than zero.");
        return;
    }

    const expense = {
        id: Date.now(),
        title: title,
        amount: amount,
        category: category,
        date: date
    };

    expenses.push(expense);
    saveExpenses();

    expenseForm.reset();
    dateInput.value = new Date().toLocaleDateString("en-CA");

    renderExpenses();
});

// Format money in Indian Rupees
function formatMoney(amount) {
    return amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Display expenses
function renderExpenses() {
    expenseList.innerHTML = "";

    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch =
            expense.title.toLowerCase().includes(searchText) ||
            expense.category.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "all" ||
            expense.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    filteredExpenses.forEach(expense => {
        const li = document.createElement("li");

        const details = document.createElement("div");
        details.className = "expense-details";

        const title = document.createElement("h3");
        title.textContent = expense.title;

        const category = document.createElement("p");
        category.textContent = "Category: " + expense.category;

        const date = document.createElement("p");
        date.textContent = "Date: " + expense.date;

        details.append(title, category, date);

        const amount = document.createElement("span");
        amount.className = "expense-amount";
        amount.textContent = "₹" + formatMoney(expense.amount);

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.dataset.action = "edit";
        editButton.dataset.id = expense.id;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = expense.id;

        li.append(details, amount, editButton, deleteButton);
        expenseList.appendChild(li);
    });

    // Update summary using ALL expenses, not filtered results
    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    totalExpenses.textContent = formatMoney(total);
    totalCount.textContent = expenses.length;

    emptyMessage.style.display =
        filteredExpenses.length === 0 ? "block" : "none";

    emptyMessage.textContent =
        expenses.length === 0
            ? "No expenses yet. Add your first expense!"
            : "No matching expenses found.";
}

// Event delegation for Edit and Delete
expenseList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "delete") {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
    }

    if (action === "edit") {
        const expense = expenses.find(expense => expense.id === id);

        if (!expense) return;

        const newTitle = prompt("Enter expense name:", expense.title);
        if (newTitle === null) return;

        if (!newTitle.trim()) {
            alert("Expense name cannot be empty.");
            return;
        }

        const newAmountText = prompt(
            "Enter amount in rupees:",
            String(expense.amount)
        );

        if (newAmountText === null) return;

        const newAmount = Number(newAmountText);

        if (!newAmountText.trim() ||
            !Number.isFinite(newAmount) ||
            newAmount <= 0) {
            alert("Enter a valid amount greater than zero.");
            return;
        }

        expense.title = newTitle.trim();
        expense.amount = newAmount;

        saveExpenses();
        renderExpenses();
    }
});

// Search expenses
searchInput.addEventListener("input", renderExpenses);

// Filter by category
categoryFilter.addEventListener("change", renderExpenses);

// Initial display
renderExpenses();
