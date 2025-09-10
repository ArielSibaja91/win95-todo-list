document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('#task-list');
    const taskInput = document.querySelector('#task-input');
    const taskForm = document.querySelector('#task-form');

    const getAllTasks = async () => {
        try {
            const response = await fetch('https://win95-to-do-list.onrender.com/tasks');
            const tasks = await response.json();

            taskList.innerHTML = '';

            tasks.forEach(task => {
                const li = document.createElement('li');

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.style.marginRight = '10px';
                checkbox.addEventListener('change', () => {
                    updateTask(task.id, checkbox.checked);
                });

                const taskText = document.createElement('span');
                taskText.classList.add('task-text');
                taskText.textContent = task.description;

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('delete-btn');
                deleteBtn.addEventListener('click', () => {
                    deleteTask(task.id);
                });

                li.appendChild(checkbox);
                li.appendChild(taskText);
                li.appendChild(deleteBtn);

                taskList.appendChild(li);
            });
        } catch (error) {
            console.error('Error while fetching tasks:', error);
        }
    };

    const createNewTask = async (e) => {
        e.preventDefault();
        const description = taskInput.value.trim();
        if (description) {
            try {
                const response = await fetch('https://win95-to-do-list.onrender.com/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ description })
                });
                await response.json();
                getAllTasks();
                taskInput.value = '';
            } catch (error) {
                console.error('Error while adding a task:', error);
            }
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`https://win95-to-do-list.onrender.com/tasks/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                getAllTasks();
            } else {
                console.error('Error while deleting a task.', error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateTask = async (id, status) => {
        try {
            const response = await fetch(`https://win95-to-do-list.onrender.com/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: status
                })
            });
            if (response.ok) {
                getAllTasks();
            } else {
                console.error('Error updating the task completed status.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    taskForm.addEventListener('submit', createNewTask);

    getAllTasks();
});