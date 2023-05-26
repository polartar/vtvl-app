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
          const magicLinkDomain = "https://qa-v2.vtvl.io/"
          cy.origin(magicLinkDomain, { args: { email } }, ({ email }) => {
            cy.visit("/onboarding/sign-up");

              // typing the email address in the email input
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
          const $body = $iframe.contents().find('body');
          cy.wrap($body)
            .find('a:contains("Sign in now!")')
            .invoke('attr', 'href')
            .then((url) => {
              cy.log(`URL captured: ${url}`);
              const magicLink = url; // Store the captured URL in a variable
              cy.visit(magicLink, { log: true });
              capturedUrl = magicLink;
              cy.get(':nth-child(1) > .wallet-button').click()
              //cy.switchToMetamaskNotificationWindow()
              //cy.acceptMetamaskAccess()
              //cy.switchToCypressWindow()
            });
        });
    });
  });