import { faker } from '@faker-js/faker';
import 'cypress-iframe';

const randomName = faker.name.firstName();
const randomCompanyName = faker.lorem.word();
const randomWalletAddress = faker.finance.ethereumAddress();
const randomEmail = faker.internet.email()

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
          dataToWrite = email;
        } else {
          cy.log('Email not found on the page.');
        }

        if (passwordMatch) {
          const password = passwordMatch[1];
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
            });
        });
    });
  });

  it('Use magic link and perform user actions', () => {
    cy.readFile(filePath).then((fileContents) => {
      const lines = fileContents.split('\n');
      magiclink = lines[0];
      cy.visit('/');
      cy.wait(500);
      cy.visit(magiclink);
      cy.wait(2000);
      cy.get(':nth-child(1) > .wallet-button').click();
      cy.wait(2000);

      // connect to wallet
      cy.switchToMetamaskWindow();
      cy.acceptMetamaskAccess();
      cy.switchToCypressWindow();
      cy.wait(2000);

      cy.get('label.card-radio') // Select the label element
        .contains("I'm a founder of a web3 project") // Find the element containing the founder text
        .click(); // Click on the element
      cy.contains('Continue').click();
      cy.get('input[name="name"]') // Select the name element
        .type(randomName); // Enter a random name
      cy.get('input[name="company"]') // Select the company name element
        .type(randomCompanyName); // Enter a random company name
      cy.contains('Continue').click();

      // create new safe
      cy.contains('Create new Safe').click();
      cy.get('input[name="organizationName"]') // Select the org name element
        .type(randomCompanyName); // Enter a random org name
      cy.get('input[name="owners\\.0\\.name"]') // Select the owner name element
        .type(randomName); // Enter random owner name
      cy.get('input[name="owners\\.0\\.address"]') // Select the wallet address element
        .type(randomWalletAddress); // Enter fake random owner wallet address
      cy.get('input[placeholder="Enter owner email"][name="owners.0.email"]') // Select the email address element
        .type(randomEmail); // Enter email
      cy.get('button[type="submit"]') // Select the submit button
        .click(); // Click on the button
    });
  });
});
