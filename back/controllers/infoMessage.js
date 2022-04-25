const path = require('path');
const root = path.join(__dirname, '..');
const { validationResult, matchedData } = require('express-validator');
const service = require(path.join(root, 'services/infoMessage'));

const validateData = (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }
  return true;
};

const controller = {

  create: async (req, res) => {
    if (validateData) {
      const data = matchedData(req);
      const obj = await service.create(data);
      res.status(201).json(obj);
    }
  },
  read: async (req, res) => {
    if (validateData) {
      const data = matchedData(req);
      const obj = await service.read(data);
      const publicMessages = obj.filter(message => message.recipients === 'all');
      res.json(publicMessages);
    }
  },
  readPersonal: async (req, res) => {

    if (validateData) {
      const data = matchedData(req);
      const obj = await service.read(data);
      const messagesToCurrentUser = obj.filter(message => message.recipients === req.cookies.username);
      res.json(messagesToCurrentUser);
    }
  },
  readAll: async (req, res) => {
    if (validateData) {
      const data = matchedData(req);
      const obj = await service.read(data);
      const messagesSentByAndToCurrentUser = obj.filter(message => message.recipients === req.cookies.username || message.sender === req.cookies.username || message.recipients === 'all');
      res.json(messagesSentByAndToCurrentUser);
    }
  },
  update: async (req, res) => {
    if (validateData) {
      const data = matchedData(req);
      const ret = await service.update(data);
      if (ret.error)
        return res.status(404).json(ret);
      res.json(ret);
    }
  },
  delete: async (req, res) => {
    if (validateData) {
      const data = matchedData(req);
      const ret = await service.delete(data);
      if (ret.error)
        return res.status(404).json(ret);
      res.json(ret);
    }
  }
};

module.exports = controller;