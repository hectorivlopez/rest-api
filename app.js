const express = require('express')
const crypto = require('node:crypto')
const z = require('zod')

const { validateMovie, validateParcialMovie } = require('./schemas/movies')

const movies = require('./movies.json')

const app = express()
app.disable('x-powered-by')

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'jejeje' })
})

app.get('/movies', (req, res) => {
  const origin = req.header('origin')
  console.log(origin)

  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')

  const { genre } = req.query

  if (!genre) return res.json(movies)

  const filteredMovies = movies.filter((movie) =>
    movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
  )

  res.json(filteredMovies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)

  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) {
    res.status(400).json({ error: result.error.message })
  }

  const newMovie = {
    id: crypto.randomUUID,
    ...result.data
  }

  movies.push(newMovie)

  console.log('Created')

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex < 0) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const result = validateParcialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie

  return res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')

  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

app.options('/movies/:id', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  res.send(200)
})

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
