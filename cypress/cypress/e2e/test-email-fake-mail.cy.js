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
    
            cy.origin("https://qa-v2.vtvl.io/", { args: email }, (email) => {        
              // connecting to the login page of
              // the passwordless service
              cy.visit("/onboarding")
    
              // typing the email address in the email input
              cy.get(':nth-child(2) > .wallet-button').click() //member button update this to use a data-cy label
              cy.get(':nth-child(1) > .wallet-button').click() //metamask button update this to use a data-cy label
              cy.get('.h-10.relative > .h-10').click() //connect wallet button update this to use a data-cy label
              cy.visit('https://qa-v2.vtvl.io/onboarding/sign-up')
              cy.get('.input-component__input').type(email)
              cy.get('.text-xs > .flex-row > .flex').click()
    
              // clicking the "Create account" button to trigger
              // the email workflow
    
              cy.contains('Create account').click()
            })
          })
    
        // visiting Ethereal Mail again
        cy.visit("https://ethereal.email/")
        cy.wait(5000)
        cy.contains("Messages").click()
        cy.contains("Login to").click()

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
        cy.getCookie("session").then((cookie) => {
          if (cookie) {
            const sessionCookie = cookie.value
            cy.log(`Session cookie value: ${sessionCookie}`)
            cy.wrap(sessionCookie).as("sessionCookie") // Store the session cookie value in an alias

            // Run the second test inside the callback to ensure it has access to the session cookie
            it('should perform another test using the captured URL', () => {
              cy.get("@sessionCookie").then((sessionCookie) => {
                if (sessionCookie) {
                  // Use the session cookie in your test
                  cy.visit("https://qa-v2.vtvl.io/", {
                    headers: {
                      Cookie: `session=${sessionCookie}`, // Set the session cookie in the request headers
                    },
                  })

                  // Add the test assertions and actions for the second test
                  // ...
                } else {
                  // Handle the case when the session cookie is not available
                  cy.log("Session cookie not available")
                }
              })
            })
          } else {
            // Handle the case when the session cookie is not found
            cy.log("Session cookie not found")
          }
        })
      })
  })
})
})