document.addEventListener("DOMContentLoaded", function () {
    const calendarBody = document.getElementById('calendarBody');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const eventDateInput = document.getElementById('eventDate');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const addEventButton = document.getElementById('addEventButton');
    const eventsStorageKey = 'calendarEvents';
    const ratingStorageKey = 'dailyProductivityRatings';

    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function loadEvents() {
        return JSON.parse(localStorage.getItem(eventsStorageKey)) || {};
    }

    function saveEvents(events) {
        localStorage.setItem(eventsStorageKey, JSON.stringify(events));
    }

    function loadRatings() {
        return JSON.parse(localStorage.getItem(ratingStorageKey)) || {};
    }

    function saveRatings(ratings) {
        localStorage.setItem(ratingStorageKey, JSON.stringify(ratings));
    }

    function renderCalendar() {
        calendarBody.innerHTML = '';

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                const dayCell = document.createElement('td');
                dayCell.style.position = 'relative';

                if (i === 0 && j < firstDayOfMonth) {
                    dayCell.classList.add('empty');
                } else if (date > daysInMonth) {
                    dayCell.classList.add('empty');
                } else {
                    dayCell.textContent = date;
                    dayCell.classList.add('current-month');

                    const today = new Date();
                    if (date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                        dayCell.classList.add('today');
                    }

                    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    const dayEvents = loadEvents()[formattedDate];
                    const dayRatings = loadRatings()[formattedDate];

                    if (dayRatings) {
                        const ratingBox = document.createElement('div');
                        ratingBox.classList.add('rating-box');
                        ratingBox.textContent = dayRatings + '★';
                        ratingBox.title = `You rated ${dayRatings} star${dayRatings > 1 ? 's' : ''}`;
                        dayCell.appendChild(ratingBox);
                    }


                    // Etkinlik varsa nokta ve detaylar
                    if (dayEvents && dayEvents.length > 0) {
                        dayCell.classList.add('has-event');
                        const eventDot = document.createElement('div');
                        eventDot.classList.add('event-dot');
                        dayCell.appendChild(eventDot);

                        const eventCount = document.createElement('span');
                        eventCount.classList.add('event-count');
                        eventCount.textContent = dayEvents.length;
                        dayCell.appendChild(eventCount);

                        const tooltip = document.createElement('div');
                        tooltip.classList.add('event-tooltip');
                        dayCell.appendChild(tooltip);

                        dayEvents.forEach((event, index) => {
                            const eventLine = document.createElement('div');
                            eventLine.classList.add('event-item');
                            eventLine.textContent = `- ${event}`;

                            const deleteBtn = document.createElement('span');
                            deleteBtn.textContent = 'Delete';
                            deleteBtn.classList.add('delete-event-btn');
                            deleteBtn.title = 'Delete Event';

                            deleteBtn.addEventListener('click', (eventClick) => {
                                eventClick.stopPropagation();
                                if (confirm(`Are you sure you want to delete the "${event}" event?`)) {
                                    deleteEvent(formattedDate, index);
                                }
                            });

                            eventLine.appendChild(deleteBtn);
                            tooltip.appendChild(eventLine);
                        });
                    }

                    date++;
                }
                row.appendChild(dayCell);
            }
            calendarBody.appendChild(row);
        }
        currentMonthYear.textContent = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }

    function deleteEvent(dateToDelete, indexToDelete) {
        let events = loadEvents();
        if (events[dateToDelete]) {
            events[dateToDelete].splice(indexToDelete, 1);
            if (events[dateToDelete].length === 0) {
                delete events[dateToDelete];
            }
            saveEvents(events);
            renderCalendar();
        }
    }

    addEventButton.addEventListener('click', () => {
        const eventDate = eventDateInput.value;
        const eventDescription = eventDescriptionInput.value.trim();

        if (!eventDate || !eventDescription) {
            alert("Please enter the event date and description.");
            return;
        }

        let events = loadEvents();
        if (!events[eventDate]) {
            events[eventDate] = [];
        }
        events[eventDate].push(eventDescription);
        saveEvents(events);

        alert("Event added successfully!");
        eventDescriptionInput.value = '';
        renderCalendar();
    });

    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    renderCalendar();
});
