describe('Login to app', function ()
{

  const supervisor = {
    name: "Else_Kovacek",
    role: "supervisor",
    password: "0Marilou36",
    email: "Waldo.McDermott@Filomena.com"
  }
  
  const superuser = {
    name: "Grover_Huel",
    role: "superuser",
    password: "2Everette12",
    email: "Sienna_Will@hotmail.com"
  }

  beforeEach(function ()
  {
    cy.visit('http://localhost:3000')
  })

  it('Login form is shown', function() {
      // cy.contains('login').click()
    })

  it('user can log in with correct credentials', function ()
  {
    // cy.get('#username').type(user.username)
    // cy.get('#password').type(user.password)
    // cy.get('#login-button').click()
    // cy.get('#login-done-div')
    // .should('contain', user.name + ' logged in')
  })

  it('user cant log in with incorrect password', function ()
  {
    // cy.contains('login').click()
    // cy.get('#username').type(user.username)
    // cy.get('#password').type('salasana')
    // cy.get('#login-button').click()
    // cy.contains('wrong credentials')
  })

  describe('When logged in', function() {
    beforeEach(function() {
    //   cy.get('#username').type(user.username)
    //   cy.get('#password').type(user.password)
    //   cy.get('#login-button').click()
    // })

    it('User can log out', function() {
      
      // cy.get('#add-blog-button').click()
      // cy.get('#title').type('new blog')
      // cy.get('#author').type('Blog Author')
      // cy.get('#url').type('www.newblog.com')
      // cy.get('#save-blog-button').click()

      // cy.get('#blog-list').contains('new blog')
    })
  })
})