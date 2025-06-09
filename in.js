// Default Habit Arrays
const defaultDailyHabits = [
    { text: "🌊 Drink 2L water", id: "default1", completedDates: [] },
    { text: "🏃‍♂️ Morning exercise (15 min)", id: "default2", completedDates: [] },
    { text: "📚 Read a book (30 min)", id: "default3", completedDates: [] },
    { text: "🧘‍♀️ Meditation (10 min)", id: "default4", completedDates: [] },
    { text: "✍️ Journal writing", id: "default5", completedDates: [] }
];

const defaultWeeklyHabits = [
    { text: "🧹 Clean room thoroughly", id: "default6", completedDates: [] },
    { text: "👨‍👩‍👧‍👦 Call family", id: "default7", completedDates: [] },
    { text: "🏃‍♂️ Go for a long run", id: "default8", completedDates: [] },
    { text: "📊 Review weekly goals", id: "default9", completedDates: [] }
];

const defaultMonthlyHabits = [
    { text: "👥 Meet with friends", id: "default10", completedDates: [] },
    { text: "💰 Review monthly budget", id: "default11", completedDates: [] },
    { text: "🎯 Set new monthly goals", id: "default12", completedDates: [] }
];

// Generic Habit Functions
function loadDefaultHabitsIfEmpty(storageKey, defaultHabits, tableId) {
    let habits = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (habits.length === 0) {
        localStorage.setItem(storageKey, JSON.stringify(defaultHabits));
        habits = defaultHabits;
    }
    habits.forEach(habit => insertHabitRowGeneric(habit, tableId, storageKey));
}

function loadHabits(storageKey, tableId) {
    const habits = JSON.parse(localStorage.getItem(storageKey)) || [];
    habits.forEach(habit => insertHabitRowGeneric(habit, tableId, storageKey));
}

function addHabitToList(habitText, storageKey, tableId, insertRowFn) {
    if (habitText === '') {
        alert("Please enter a habit.");
        return;
    }

    let habits = JSON.parse(localStorage.getItem(storageKey)) || [];
    const newHabit = {
        text: habitText,
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        completedDates: []
    };
    habits.push(newHabit);
    localStorage.setItem(storageKey, JSON.stringify(habits));
    insertRowFn(newHabit, tableId, storageKey);
}

function insertHabitRowGeneric(habitObject, tableId, storageKey) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.warn(`Table with ID '${tableId}' not found.`);
        return;
    }

    const tbody = table.querySelector('tbody') || table;
    const newRow = tbody.insertRow();
    newRow.id = `habit-row-${habitObject.id}`;

    // Checkbox cell
    const checkboxCell = newRow.insertCell(0);
    checkboxCell.className = 'checkbox-cell';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'habit-checkbox habit-select';
    checkbox.dataset.id = habitObject.id;
    checkbox.dataset.storageKey = storageKey;
    checkboxCell.appendChild(checkbox);

    // Habit text cell
    const habitCell = newRow.insertCell(1);
    habitCell.className = 'habit-cell';
    habitCell.textContent = habitObject.text;

    // Delete button cell
    const deleteCell = newRow.insertCell(2);
    deleteCell.className = 'delete-cell';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-habit-btn';
    deleteButton.dataset.id = habitObject.id;
    deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
    deleteCell.appendChild(deleteButton);

    // Check if habit is completed today
    const today = new Date().toISOString().slice(0, 10);
    const isCompletedToday = (habitObject.completedDates || []).includes(today);
    checkbox.checked = isCompletedToday;

    if (isCompletedToday) {
        habitCell.classList.add("strikethrough");
    } else {
        habitCell.classList.remove("strikethrough");
    }

    // Add event listeners
    checkbox.addEventListener("change", function (e) {
        const habitId = e.target.dataset.id;
        const storageKey = e.target.dataset.storageKey;
        const isChecked = e.target.checked;

        let habits = JSON.parse(localStorage.getItem(storageKey)) || [];
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;

        const currentHabit = habits[habitIndex];
        if (isChecked) {
            if (!currentHabit.completedDates.includes(today)) {
                currentHabit.completedDates.push(today);
            }
            habitCell.classList.add("strikethrough");
        } else {
            currentHabit.completedDates = currentHabit.completedDates.filter(date => date !== today);
            habitCell.classList.remove("strikethrough");
        }
        localStorage.setItem(storageKey, JSON.stringify(habits));
    });

    deleteButton.addEventListener("click", function () {
        const habitId = this.dataset.id;
        if (confirm("Are you sure you want to delete this habit?")) {
            removeHabitFromStorage(habitId, storageKey);
            newRow.remove();
        }
    });
}

function removeHabitFromStorage(habitId, storageKey) {
    let habits = JSON.parse(localStorage.getItem(storageKey)) || [];
    habits = habits.filter(habit => habit.id !== habitId);
    localStorage.setItem(storageKey, JSON.stringify(habits));
}

// Add Habit Button Functions
function addDailyHabit() {
    const habitText = document.getElementById('newHabitInput').value;
    addHabitToList(habitText, 'dailyHabits', 'dailyGoalsTable', insertHabitRowGeneric);
    document.getElementById('newHabitInput').value = '';
}

function addWeeklyHabit() {
    const habitText = document.getElementById('newWeeklyHabitInput').value;
    addHabitToList(habitText, 'weeklyHabits', 'weeklyGoalsTable', insertHabitRowGeneric);
    document.getElementById('newWeeklyHabitInput').value = '';
}

function addMonthlyHabit() {
    const habitText = document.getElementById('newMonthlyHabitInput').value;
    addHabitToList(habitText, 'monthlyHabits', 'monthlyGoalsTable', insertHabitRowGeneric);
    document.getElementById('newMonthlyHabitInput').value = '';
}

// Delete Selected Habits
function deleteSelectedHabits(storageKey, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const checkboxes = table.querySelectorAll('.habit-select:checked');
    if (checkboxes.length === 0) {
        alert("Please select at least one habit to delete.");
        return;
    }

    if (confirm(`Are you sure you want to delete ${checkboxes.length} selected habits?`)) {
        let habits = JSON.parse(localStorage.getItem(storageKey)) || [];
        checkboxes.forEach(checkbox => {
            const habitId = checkbox.dataset.id;
            habits = habits.filter(habit => habit.id !== habitId);
            const row = document.getElementById(`habit-row-${habitId}`);
            if (row) row.remove();
        });
        localStorage.setItem(storageKey, JSON.stringify(habits));
    }
}

// Weekly Note Functions
function saveWeeklyNote() {
    const textarea = document.getElementById('weeklyNoteTextarea');
    const note = textarea?.value.trim();
    if (!note) {
        alert("Please write a note before saving.");
        return;
    }

    const currentMonth = new Date().getMonth();
    const weeklyNotes = JSON.parse(localStorage.getItem('weeklyNotes')) || [];

    weeklyNotes.push({
        month: currentMonth,
        text: note,
        date: new Date().toISOString().slice(0, 10)
    });

    localStorage.setItem('weeklyNotes', JSON.stringify(weeklyNotes));
    textarea.value = '';
    alert("Weekly note saved!");
}

function clearWeeklyNote() {
    if (confirm("Are you sure you want to clear your weekly note?")) {
        localStorage.removeItem('weeklyNotes');
        const textarea = document.getElementById('weeklyNoteTextarea');
        if (textarea) textarea.value = '';
    }
}

// ✅ GÜNCELLENEN DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Clear existing habits first
    localStorage.removeItem('dailyHabits');
    localStorage.removeItem('weeklyHabits');
    localStorage.removeItem('monthlyHabits');
    
    // Load default habits
    loadDefaultHabitsIfEmpty('dailyHabits', defaultDailyHabits, 'dailyGoalsTable');
    loadDefaultHabitsIfEmpty('weeklyHabits', defaultWeeklyHabits, 'weeklyGoalsTable');
    loadDefaultHabitsIfEmpty('monthlyHabits', defaultMonthlyHabits, 'monthlyGoalsTable');

    document.getElementById('saveWeeklyNoteButton')?.addEventListener('click', saveWeeklyNote);
    document.getElementById('clearWeeklyNoteButton')?.addEventListener('click', clearWeeklyNote);
    document.getElementById('deleteSelectedDaily')?.addEventListener('click', () => {
        deleteSelectedHabits('dailyHabits', 'dailyGoalsTable');
    });
    document.getElementById('deleteSelectedWeekly')?.addEventListener('click', () => {
        deleteSelectedHabits('weeklyHabits', 'weeklyGoalsTable');
    });
    document.getElementById('deleteSelectedMonthly')?.addEventListener('click', () => {
        deleteSelectedHabits('monthlyHabits', 'monthlyGoalsTable');
    });
});

// Productivity Rating Stars
document.addEventListener("DOMContentLoaded", function () {
    const stars = Array.from(document.querySelectorAll("#productivityStars span")).reverse();
    const ratingKey = "dailyProductivityRatings";
    const today = new Date().toISOString().split("T")[0];

    const savedRatings = JSON.parse(localStorage.getItem(ratingKey)) || {};
    const todayRating = savedRatings[today] || 0;

    if (todayRating) {
        highlightStars(todayRating);
        updateCalendarStars(todayRating);
    }

    stars.forEach((star, index) => {
        // Handle hover effects
        star.addEventListener("mouseenter", () => {
            stars.forEach((s, idx) => {
                if (idx <= index) {
                    s.style.color = '#fbbf24';
                    s.style.transform = 'scale(1.2)';
                } else {
                    s.style.color = '#e2e8f0';
                    s.style.transform = 'scale(1)';
                }
            });
        });

        star.addEventListener("mouseleave", () => {
            stars.forEach((s) => {
                s.style.transform = 'scale(1)';
            });
            highlightStars(savedRatings[today] || 0);
        });

        // Handle click
        star.addEventListener("click", () => {
            const rating = index + 1;
            savedRatings[today] = rating;
            localStorage.setItem(ratingKey, JSON.stringify(savedRatings));
            highlightStars(rating);
            updateCalendarStars(rating);

            // Add animation effect
            star.style.transform = 'scale(1.3)';
            setTimeout(() => {
                star.style.transform = 'scale(1)';
            }, 200);
        });
    });

    function highlightStars(rating) {
        stars.forEach((star, idx) => {
            if (idx < rating) {
                star.style.color = '#fbbf24';
                star.classList.add('active');
            } else {
                star.style.color = '#e2e8f0';
                star.classList.remove('active');
            }
            star.style.transform = 'scale(1)';
        });
    }

    function updateCalendarStars(rating) {
        const calendarStars = document.getElementById('calendarStars');
        if (rating === 0) {
            calendarStars.textContent = 'Not rated yet';
            calendarStars.style.color = '#94a3b8';
        } else {
            calendarStars.textContent = '★'.repeat(rating);
            calendarStars.style.color = '#fbbf24';
        }
    }
});
