import 'cypress-iframe';

describe('email test spec', () => {
  afterEach(() => {
    cy.disconnectMetamaskWalletFromAllDapps();
    cy.resetMetamaskAccount();
  });

  let dataToWrite;
  let filePath = '.credentials.txt';
  let email;
  let password;
  let magiclink;
  it('Create and save email and password in environment variables', () => {
    cy.visit('https://ethereal.email/create');
    cy.get('.btn').click();
    cy.get('body')
      .invoke('text')
      .then((text) => {
        const emailRegex = /Username\s+([\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,6})/;
        const passwordRegex = /Password\s+([^\s]+)/;
        const emailMatch = text.match(emailRegex);
        const passwordMatch = text.match(passwordRegex);

        if (emailMatch) {
          const email = emailMatch[1];
          //cy.log('Extracted email:', email)
          //Cypress.env('email', email) // Save email in environment variable
          dataToWrite = email;
        } else {
          cy.log('Email not found on the page.');
        }

        if (passwordMatch) {
          const password = passwordMatch[1];
          //cy.log('Extracted password:', password)
          //cy.wait(5000)
          dataToWrite = dataToWrite + '\n' + password;

          //Cypress.env('password', password) // Save password in environment variable
        } else {
          cy.log('Password not found on the page.');
        }
        //const dataToWrite = email + '\n' + password
        cy.log('Extracted data:', dataToWrite);
        cy.writeFile(filePath, dataToWrite);
      });
  });

  it('Sign up in app', () => {
    cy.visit('/onboarding/sign-up');
    cy.readFile(filePath).then((fileContents) => {
      // Split the file contents into an array of lines
      const lines = fileContents.split('\n');

      // Extract the variables from the lines
      email = lines[0];
      password = lines[1];

      // Use the variables as needed
      cy.log('Email:', email);
      cy.log('Password:', password);

      cy.get('.input-component__input').type(email);
      cy.get('.text-xs > .flex-row > .flex').click();
      cy.contains('Create account').click();
      cy.wait(5000);
    });
  });

  it('Confirm email', () => {
    cy.visit('https://ethereal.email/login');
    cy.readFile(filePath).then((fileContents) => {
      // Split the file contents into an array of lines
      const lines = fileContents.split('\n');

      // Extract the variables from the lines
      email = lines[0];
      password = lines[1];

      // Use the variables as needed
      cy.log('Email:', email);
      cy.log('Password:', password);

      cy.get('#address').type(email);
      cy.get('#password').type(password);
      cy.get('.btn:nth-child(1)').click();
      cy.visit('https://ethereal.email/messages');
      cy.contains('Login to VTVL').click();
      cy.get('#message > iframe')
        .should('be.visible')
        .then(($iframe) => {
          const $body = $iframe.contents().find('body');
          cy.wrap($body)
            .find('a:contains("Sign in now!")')
            .invoke('attr', 'href')
            .then((url) => {
              cy.log(`URL captured: ${url}`);
              magiclink = url; // Store the captured URL in a variable
              cy.writeFile(filePath, magiclink);
              cy.visit(magiclink, { log: true });
            });
        });
    });
  });
});
