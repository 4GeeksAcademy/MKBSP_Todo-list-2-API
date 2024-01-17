import React, { useEffect, useState } from "react";

//include images into your bundle
import { number } from "prop-types";


//create your first component
const Home = () => {
	const [taskStatus, setTaskStatus] = useState("toDo");
	const [task, setTask] = useState([]);
	const [inputValue, setInputValue] = useState("")

	const todos = [];

	fetch('https://playground.4geeks.com/apis/fake/todos/user/MKBSP', {
		method: "POST",
		body: JSON.stringify(todos),
		headers: {
			"Content-Type": "application/json"
		}
	})
		.then(resp => {
			console.log(resp.ok);
			console.log(resp.status);
			console.log(resp.text());
			return resp.json();
		})
		.then(data => {
			console.log(data);
		})
		.catch(error => {
			console.log(error);
		});

	const fetchTask = () => {
		fetch('https://playground.4geeks.com/apis/fake/todos/user/MKBSP')
			.then(response => {
				if (!response.ok && response.status === 404) {
					console.log("User does not exist, creating user...");
					createUser();
				} else {
					return response.json();
				}
			})
			.then(data => {
				if (data && Array.isArray(data)) {
					const tasksWithCompletion = data.map(task => ({ ...task, completed: false }));
					setTask(tasksWithCompletion);
				}
			})
			.catch(error => console.error("Error fetching tasks:", error));
	};

	useEffect(() => {
		fetchTask()
	}, []);

	const addTask = (newTaskLabel) => {
		const newTask = { id: Date.now(), label: newTaskLabel, completed: false };
		const updatedTasks = [...task, newTask];
		setTask(updatedTasks);
		updateTasksInDB(updatedTasks);
	};

	const updateTasksInDB = (updatedTasks) => {
		const tasksForBackend = updatedTasks.map(task => ({
			label: task.label,
			done: task.completed
		}));

		fetch('https://playground.4geeks.com/apis/fake/todos/user/MKBSP', {
			method: "PUT",
			body: JSON.stringify(tasksForBackend),
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(resp => resp.json())
			.then(data => {
				console.log('Data:', data);
			})
			.catch(error => {
				console.log('Error:', error);
			});
	};


	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	};

	//.preventDefault() is to avoid the form submitting with nothing
	//.trim() is to avoid submitting an empty form with only spaces
	//setInputValue("") is to delete the text in the input form when submitted

	const handleSubmit = (event) => {
		event.preventDefault();
		if (inputValue.trim() !== "") {
			addTask(inputValue); // Use addTask to handle adding the new task and updating the database
			setInputValue("");
		}
	};

	const toggleTaskCompletion = (itemId) => {
		setTask(task.map(item =>
			item.id === itemId ? { ...item, completed: !item.completed } : item
		))
	};

	const numberOfTasksMarkedAsIncomplete = () => {
		const uncompletedTasks = task.filter(item => !item.completed).length;
		return uncompletedTasks === 0 ? "Add a couple of tasks here!" : uncompletedTasks;
	};


	const numberOfTasksMarkedAsCompleted = () => {
		const completedTasks = task.filter(item => item.completed).length;
		return completedTasks === 0 ? "You're all caught up" : completedTasks;
	};

	const createUser = () => {
		fetch('https://playground.4geeks.com/apis/fake/todos/user/MKBSP', {
			method: "POST",
			body: JSON.stringify([]),
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					console.log("User created successfully");
					fetchTask();
				} else {
					console.error("Failed to create user:", response);
				}
			})
			.catch(error => console.error("Error creating user:", error));
	}

	//Delete Functions
		//Delete
	const deleteTask = (itemId) => {
		const updatedTasks = task.filter(item => item.id !== itemId);
		setTask(updatedTasks);
		updateTasksInDB(updatedTasks); // connecting with the with the database after deletion
	};

		//DeleteAll - We are effectively just putting/updating the dB with an Empty Array 
	const deleteAllTasks = () => {
		task.forEach(item => {
			// Assuming the API supports deleting individual tasks by id
			fetch(`https://playground.4geeks.com/apis/fake/todos/user/MKBSP/task/${item.id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					console.log(`Task with id ${item.id} deleted successfully`);
				})
				.catch(error => console.error("Error deleting task:", error));
		});
		setTask([]); // Clear the tasks in the frontend state
	};


	return (
		<div className="text-center">
			<div>
				<h1>
					This is your to-do list
				</h1>
			</div>
			<div>
				<form onSubmit={handleSubmit}>
					<input
						placeholder="Add your tasks here"
						value={inputValue}
						onChange={handleInputChange}>
					</input>
					<button>Create</button>
				</form>
			</div>
			<div>
				<h3>To Do</h3>
				<ul className="list-group">
					{task.filter(item => !item.completed).map((item) => (
						<li className="list-group-item" id="to-hover" key={item.id}>
							{item.label}
							<button id="to-show" onClick={() => toggleTaskCompletion(item.id)}>
								{item.completed ? 'Mark as Uncompleted' : 'Mark as Completed'}
							</button>
							<button id="to-show" onClick={() => deleteTask(item.id)}>
								Delete
							</button>
						</li>
					))}
				</ul>
				<p>{numberOfTasksMarkedAsIncomplete()}</p>
				<h3>Done</h3>
				<ul className="list-group">
					{task.filter(item => item.completed).map((item) => (
						<li className="list-group-item" id="to-hover" key={item.id}>
							{item.label}
							<button id="to-show" onClick={() => deleteTask(item.id)}>
								Delete
							</button>
						</li>
					))}
				</ul>
				<p>{numberOfTasksMarkedAsCompleted()}</p>
			</div>
			<button onClick={deleteAllTasks}>Delete All Tasks</button>
		</div>
	);
};

export default Home;

