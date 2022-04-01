const path = require('path');
const root = path.join(__dirname, '..');
const {validationResult, matchedData} = require('express-validator');
const service = require(path.join(root, 'services/infoMessage'));

const controller = {
  create: async (req, res) => {
    const validationErrors = validationResult(req);
    const data = matchedData(req);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const obj = await service.create(data);
    res.status(201).json(obj);
  },
  read: async (req, res) => {
    const validationErrors = validationResult(req);
    const data = matchedData(req);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const obj = await service.read(data);
    const publicMessages = obj.filter( message =>  message.recipients === 'all' );

    res.json(publicMessages);
  },
  readPersonal: async (req,res) => {
    const validationErrors = validationResult(req);
    const data = matchedData(req);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const obj = await service.read(data);

    const messagesToCurrentUser = obj.filter( message => message.recipients === req.cookies.id );

    res.json(messagesToCurrentUser);
  },
  readAll: async (req,res) => {
    const validationErrors = validationResult(req);
    const data = matchedData(req);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const obj = await service.read(data);

    const messagesSentByAndToCurrentUser = obj.filter( message => message.recipients === req.cookies.id || message.sender === req.cookies.id || message.recipients === 'all' );

    res.json(messagesSentByAndToCurrentUser);
  },
  update: async (req, res) => {
    const validationErrors = validationResult(req);
    const data = matchedData(req);
    console.log(req.body);
    console.log(data);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const ret = await service.update(data);
    if(ret.error)
      return res.status(404).json(ret);
    res.json(ret);
  },
  delete: async (req, res) => {
    //console.log('controllerdeletes', req.body);
    const validationErrors = validationResult(req);

    //console.log('controllerdeletes', validationErrors);

    const data = matchedData(req);
    if(!validationErrors.isEmpty()) {
      return res.status(400).json({errors: validationErrors.array()});
    }
    const ret = await service.delete(data);
    if(ret.error)
      return res.status(404).json(ret);
    res.json(ret);
  }
};

module.exports = controller;