document.addEventListener('DOMContentLoaded', () => {
    const calendarBody = document.querySelector('.calendar-body');
    const monthYear = document.querySelector('.month-year');
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKRMr1Rj9lj0OvpvPQy04ydgU0nXtacDWhqnvq1wznkJJ46P9B_FZxhCHV2NsUlreW7OqHM-ZP7Lky/pub?gid=1386834576&single=true&output=csv";

    const currentDate = new Date();
    let displayedMonth = currentDate.getMonth();
    let displayedYear = currentDate.getFullYear();
    let tasks = [];

    // Fetch and parse CSV data
    fetch(csvUrl)
        .then(response => response.text())
        .then(data => {
            tasks = parseCSV(data);
            renderCalendar(displayedMonth, displayedYear);
        });

    function parseCSV(data) {
        const rows = data.split('\n').slice(2); // Skip header rows
        return rows.map(row => {
            const [checkbox, date, task] = row.split(',');
            const formattedDate = new Date(date.trim());
            return {
                completed: checkbox.trim() !== '', // Jika ada isi di kolom checkbox, berarti sudah selesai
                dueDate: formattedDate,
                name: task.trim(),
                overdue: formattedDate < currentDate // Tandai sebagai `true` jika sudah melewati tanggal
            };
        });
    }

    function renderCalendar(month, year) {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        monthYear.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

        calendarBody.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            calendarBody.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('button');
            dayCell.textContent = day;
            dayCell.onclick = () => selectDate(new Date(year, month, day));
            calendarBody.appendChild(dayCell);
        }

        renderTasks(new Date(year, month, currentDate.getDate()));
    }

    function renderTasks(selectedDate) {
        const todayTasksContainer = document.querySelector('#today-tasks');
        const upcomingTasksContainer = document.querySelector('#upcoming-tasks');

        todayTasksContainer.innerHTML = '';
        upcomingTasksContainer.innerHTML = '';

        tasks.forEach(task => {
            const taskDate = new Date(task.dueDate);
            const isOverdue = task.overdue && !task.completed;

            const taskElement = document.createElement('div');
            taskElement.className = `task ${isOverdue ? 'overdue' : ''}`;
            taskElement.innerHTML = `
                <span>${task.name}</span>
                <span>Due: ${taskDate.toLocaleDateString()}</span>
                <span>Status: ${task.completed ? '✅' : isOverdue ? '⚠️ Overdue' : 'Pending'}</span>
            `;

            if (taskDate.toDateString() === selectedDate.toDateString()) {
                todayTasksContainer.appendChild(taskElement);
            } else if (taskDate > selectedDate) {
                upcomingTasksContainer.appendChild(taskElement);
            }
        });
    }

    function selectDate(date) {
        renderTasks(date);
    }

    document.querySelector('.prev-month').onclick = () => {
        displayedMonth--;
        if (displayedMonth < 0) {
            displayedMonth = 11;
            displayedYear--;
        }
        renderCalendar(displayedMonth, displayedYear);
    };

    document.querySelector('.next-month').onclick = () => {
        displayedMonth++;
        if (displayedMonth > 11) {
            displayedMonth = 0;
            displayedYear++;
        }
        renderCalendar(displayedMonth, displayedYear);
    };
});
