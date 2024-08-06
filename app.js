const express = require('express')
const { MongoClient } = require('mongodb')
const client = new MongoClient('mongodb://localhost:27017')
const app = express()
const fs = require('fs')

const multer = require('multer')
const file = multer({ dest: 'public/uploads' })
app.use(express.json())
app.use(express.static('public'))

app.get('/search', async (req, res) => {
  try {
    await client.connect()
    const db = client.db('search')
    const collection = db.collection('pages')

    const term = req.query.q
    const pattern = new RegExp(`^${term}`, 'i')
    const matchedPages = await collection.find({ name: pattern }).toArray()

    if (matchedPages.length > 0) {
      res.send(matchedPages)
    } else {
      res.send('No matches found')
    }

  } finally {
    await client.close()
  }
})


app.post('/parse', file.single('textfile'), async (req, res) => {
  try {
    await client.connect()
    const db = client.db('search')
    const collection = db.collection('pages')

    const fileContent = fs.readFileSync(req.file.path, 'utf-8')

    const arr = fileContent.split(',').map(name => name.trim().replace(/"/g, ''))
    const documents = arr.map(name => ({ name }))
    await collection.insertMany(documents)
    res.send('ok')

  } finally {
    await client.close()
  }
})

app.listen(3000)