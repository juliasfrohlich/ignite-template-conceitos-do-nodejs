const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(
    (user) => user.username === username
  )

  if (!user) {
    return response.status(401).send({message: "Couldn't find that username in our database!"})
  }

  request.user = user

  return next()
  
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const checkUsernameAlreadyExists = users.some(
    (user) => user.username === username
  )
  
  if (checkUsernameAlreadyExists) {
    return response.status(400).json({error: "Username already in use!"})
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request

  return response.status(200).json(user.todos)


});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body
  const {user} = request

  const TODOS = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(TODOS)

  return response.status(201).json(TODOS)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params
  const { user } = request


  const todo = user.todos.find(
    (todo) => todo.id === id
  )

  if (!todo) {
    return response.status(404).send({error: "TODO not found!"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request


  const todo = user.todos.find(
    (todo) => todo.id === id
  )

  if (!todo) {
    return response.status(404).send({error: "TODO not found!"})
  }

  todo.done = true

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { todos } = request.user


  const todo = todos.findIndex(
    (todo) => todo.id === id
  )

  if (todo === -1) {
    return response.status(404).send({error: "TODO not found!"})
  }
  
  todos.splice(todo, 1)
  return response.status(204).json(todos)
});

module.exports = app;