const path = require('path')

const root = path.join(__dirname, '..')
const userModel = require(path.join(root, 'models', 'user'))
const config = require(path.join(root, 'config', 'config'))

const validate = require('validate.js')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

// Make this into an npm package, move somewhere else, or find a replacement
// package
const stringify = _.partialRight(JSON.stringify, undefined, 2)

/**
 * Create a new user.
 *
 * @param {object} user - The properties of the new user { name, password, role, phone? }
 * @return {Promise<number[]>} The added users' id
 *
 * @example
 * exports.create({ name: 'Mark', password: 'password', role: 'superuser' })
 */
exports.create = async function createUser(user) {
  /* TODO
   * Inject constraints
   */
  const constraints = {
    name: {
      presence: true
      , format: {
        // TODO fix with something proper
        pattern: /^[ -~ÅÄÖåäö]*$/
      } 
      , type: 'string'
      , length: {
        minimum: 1
        , maximum: 255
      }
    }
    , password: {
      presence: true
      , type: 'string'
      , length: {
        minimum: 4
        // Bcrypt max length is 72 bytes but it seems to allow more, one
        // unicode character can be up to 4 bytes so idk what to do about this
        , maximum: 72
      }
    }
    , role: {
      // Constraints enforced by database system, this is only for nicer
      // error message
      presence: true
      , format: {
        pattern: /^(supervisor|superuser)$/
      }
    }, phone: {
      // TODO replace with validator.isMobilePhone or something similiar
      type: 'string'
    }
  }

  let validationFail
  if((validationFail = validate(user, constraints))) {
    throw Error(stringify(validationFail))
  }

  let digest;
  
  try {
    digest = await bcrypt.hash(user.password
                               , config.bcrypt.hashRounds)
  } catch(e) {
    // Please log me at least
    throw e;
  }

  const modelEntry = {
    name: user.name
    , digest: digest
    , role: user.role
    , phone: user.phone
  }

  return userModel.create(modelEntry)
}

