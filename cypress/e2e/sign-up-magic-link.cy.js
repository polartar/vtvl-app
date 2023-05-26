import 'cypress-iframe'

describe("email test spec", () => {
  let capturedUrl // Declare the capturedUrl variable

  it("should log in", () => {
    // connecting to the temporary email provider
    cy.visit("https://ethereal.email/create")
    cy.get('.btn').click()
    cy.get('.row:nth-child(8) tr:nth-child(2) code')
      .invoke("text")
      .then((email) => {
      // setting the passwordless service origin and
      // passing the email address as an argument

        cy.origin("http://localhost:3000", { args: email }, (email) => {
        // connecting to the login page of
        // the passwordless service
          cy.visit("/onboarding/sign-up")
          // typing the email address in the email input
          cy.get('.input-component__input').type(email)
          cy.get('.text-xs > .flex-row > .flex').click()

          // clicking the "Create account" button to trigger
          // the email workflow

          cy.contains('Create account').click()
        })
      })

    // visiting Ethereal Mail again
    cy.visit("https://ethereal.email/messages")
    cy.wait(5000) // email takes more or less 5s
    cy.reload() // refresh page to get email
    cy.contains("Login to VTVL").click() //click on email

    cy.get('#message > iframe')
      .should('be.visible')
      .then(($iframe) => {
        const $body = $iframe.contents().find('body')
        cy.wrap($body)
          .find('a:contains("Sign in now!")')
          .invoke('attr', 'href')
          .then((url) => {
            cy.log(`URL captured: ${url}`)
            cy.visit(url, { log: true }) // Visit the captured URL in the current tab/window
            capturedUrl = url // Store the captured URL in the variable
            cy.get(':nth-child(1) > .wallet-button').click()
            // commands for connecting the wallet later
            //cy.switchToMetamaskNotificationWindow()
            //cy.acceptMetamaskAccess()
            //cy.switchToCypressWindow()
          })
      })
  })
})