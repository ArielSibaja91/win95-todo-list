document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.querySelector('#task-list');
    const taskInput = document.querySelector('#task-input');
    const taskForm = document.querySelector('#task-form');

    const getAllTasks = async () => {
        try {
            const response = await fetch('http://localhost:3000/tasks');
            const tasks = await response.json();

            taskList.innerHTML = '';

            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = task.description;
                li.style.textDecoration = task.completed ? 'line-through' : 'none';
                taskList.appendChild(li);
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Eliminar';
                deleteBtn.classList.add('delete-btn')
                deleteBtn.addEventListener('click', () => {
                    deleteTask(task.id);
                });
                const completedBtn = document.createElement('button');
                completedBtn.textContent = 'Done';
                completedBtn.classList.add('completed-btn');
                completedBtn.addEventListener('click', () => {
                    updateTask(task.id, task.completed);
                });

                li.appendChild(deleteBtn);
                li.appendChild(completedBtn);
            });
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
        }
    };

    const createNewTask = async (e) => {
        e.preventDefault();
        const description = taskInput.value.trim();
        if (description) {
            try {
                const response = await fetch('http://localhost:3000/tasks', {
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
                console.error('Error al añadir la tarea:', error);
            }
        }
    };

    const deleteTask = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                getAllTasks();
            } else {
                console.error('Error al eliminar la tarea.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const updateTask = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:3000/tasks/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: !status
                })
            });
            if (response.ok) {
                getAllTasks();
            } else {
                console.error('Error al actualizar la tarea.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    taskForm.addEventListener('submit', createNewTask);

    getAllTasks();
});