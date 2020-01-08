const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')

let files = []
walkDir('./static', (err, arr) => {
  if (err) {
    console.error(err)
    return
  }
  files = arr
})

app.use(express.static(path.join(__dirname, 'static')))
app.use(express.static(path.join(__dirname, 'public')))

// 允许跨域访问
app.use("*", function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With");
  next()
})

app.get('/img', (req, res) => {
  const { id } = req.query

  if (id) {
    if (files[id]) {
      return res.sendFile(files[id])
    }
    return res.status(404).send()
  }

  const choose = Math.floor(Math.random() * files.length)

  return res.sendFile(files[choose])
})

app.get('/img_id_list', (req, res) => {

  const { count = 10 } = req.query

  const idList = []
  for (let i = 0; i < count; i++) {
    const choose = Math.floor(Math.random() * files.length)
    idList.push(choose)
  }

  return res.json(idList)
})

const port = normalizePort(process.env.PORT || '8889')
app.listen(port, () => {
  console.log(`Server Listening on port ${port}`)
})

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * 递归遍历文件夹 https://stackoverflow.com/a/5827895
 * @param dir: 目录路径
 * @param done: function(err, files)
 */
function walkDir(dir, done) {
  // console.log(dir)

  let results = []
  fs.readdir(dir, function (err, list) {
    if (err) return done(err)

    let pending = list.length
    if (!pending) return done(null, results)

    list.forEach(function (file) {
      file = path.resolve(dir, file)

      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          walkDir(file, function (err, res) {
            results = results.concat(res)
            if (!--pending) done(null, results)
          })
        } else {
          results.push(file)
          if (!--pending) done(null, results)
        }
      })
    })
  })
}