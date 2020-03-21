const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult, matchedData } = require('express-validator');
const _ = require('lodash')

const path = require('path')
const root = path.join(__dirname, '..')
const services = require(path.join(root, 'services'))
const secret = require(path.join(root, 'config', 'config')).jwt.secret

const controller = {
  sign: async function signUser(request, response) {
    const credentials = matchedData(request, { locations: ['body'] })

    const id = await services.user.authenticate(credentials)
    if(id === undefined) {
      return response.set('WWW-Authenticate', 'Basic').status(401).send()
    }
    
    return response.send(
      jwt.sign({
        id: id
      }, secret))
  }

  , readAll: async function readAllUsers(request, response) {
    const query = matchedData(request, { locations: ['query'] })

    return response.send(await services.user.read(query))
  }

  , create: async function createUser(request, response) {
    const userDetails = matchedData(request, { locations: ['body'] })

    return response.status(201).send(await services.user.create(userDetails))
  }

  , read: async function readUser(request, response) {
    const query = matchedData(request)

    return response.send(await services.user.read(query))
  }

  , update: async function updateUser(request, response) {
    const id = matchedData(request, { locations: ['params'] })
    const updates = matchedData(request, {locations: ['body'] })

    try {
      await services.user.update(id, updates)
      return response.status(204).send()
    } catch(e) {
      return response.status(500).send()
      throw e
    }
  }

  , delete: async function deleteUser(request, response) {
    const query = matchedData(request, { locations: ['params'] })
    return response.send(await services.user.delete(query))
  }
}

module.exports = controller
