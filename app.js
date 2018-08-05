require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const debug = require('debug')('app')
const { DRIFT_VERIFICATION_TOKEN } = process.env
const { handleMessage } = require('./libz/incoming')

const Raven = require('raven')
Raven.config(
  'https://ef897a7e139c44b6a597c6b6a65147bc@sentry.io/1249642'
).install()
app.use(Raven.requestHandler())
app.use(Raven.errorHandler())
app.use(function onError (err, req, res, next) {
  console.error(err.message)
  res.status(500).end(`${res.sentry} ${err.message}` + '\n')
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', authorize, status)

app.post('/tone', authorize, tonyTheTiger)

function tonyTheTiger ({ body }, response, next) {
  const { type, orgId, data } = body
  if (type === 'new_message') {
    // debug('what are we sending %O', data)
    handleMessage(data, orgId)
  }
  response.send('ok')
}
function authorize ({ body: { token } }, res, next) {
  if (DRIFT_VERIFICATION_TOKEN !== token) {
    return res.status(401).send('Not authorized')
  }
  return next()
}

function status (_, response) {
  response.send(`<style>body {display: flex;justify-content: center;
    align-items: center;} span {font-size: 45px;font-family: Arial;}</style>
    <span>🧚‍ We Are Live!, keep calm and code on 🧚</span>`)
}

module.exports = app
