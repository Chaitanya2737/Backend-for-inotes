const connectToMongo =require("./db")
const express = require('express')
const app = express()
var cors = require('cors')
app.use(cors())



connectToMongo()

const port = 5000
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello chaitanya!')
})
app.use("/api/auth", require("./route/auth"))
app.use("/api/note", require("./route/note"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})