import 'cypress-iframe';

describe('Test Suite', () => {
  let email;
  let password;
  let capturedUrl;

  it("Go to ethereal, create fake email, and extract email/pw", () => {
    cy.visit('https://ethereal.email/create');
    cy.get('.btn').click();
    cy.get('body').invoke('text').then((text) => {
      const emailRegex = /Username\s+([\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,6})/;
      const passwordRegex = /Password\s+([^\s]+)/;
      const emailMatch = text.match(emailRegex);
      const passwordMatch = text.match(passwordRegex);
      
      if (emailMatch) {
        email = emailMatch[1];
        cy.log('Extracted email:', email);
      } else {
        cy.log('Email not found on the page.');
      }
      
      if (passwordMatch) {
        password = passwordMatch[1];
        cy.log('Extracted password:', password);
      } else {
        cy.log('Password not found on the page.');
      }
    });
    
    cy.saveLocalStorage();
  });

  it('Go to ethereal again and login with the email/pw from the previous flow', () => {
    cy.visit('https://ethereal.email/messages');
    cy.visit('https://ethereal.email/login');
    cy.get('#address').type(email);
    cy.get('#password').type(password);
    cy.get('.btn:nth-child(1)').click();
    cy.visit('https://ethereal.email/messages');
    cy.contains("This is your ethereal mailbox");
  });


  it('Go to qa env and sign up using API', () => {
    const apiUrl = 'https://qa-v2.vtvl.io/api/email/login';
    const headers = {
      'authority': 'qa-v2.vtvl.io',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      'cookie': '_ga=GA1.1.2069499864.1684969088; _ga_118095MHP5=GS1.1.1685026610.2.0.1685026643.0.0.0',
      'origin': 'https://qa-v2.vtvl.io',
      'referer': 'https://qa-v2.vtvl.io/onboarding/sign-up',
      'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    };
  
    cy.request({
      method: 'POST',
      url: apiUrl,
      headers: headers,
      body: {
        email: email, // Use the generated email here
        newUser: true,
        websiteName: "",
        emailTemplate: {
          websiteName: "VTVL",
          theme: {
            primaryColor: "#1b369a",
            secondaryColor: "#f9623b",
            logoImage: "https://firebasestorage.googleapis.com/v0/b/vtvl-v2-dev.appspot.com/o/email-template-assets%2Fvtvl-email-template-logo.png?alt=media&token=2b5bac6e-d595-4a85-b926-6d928e2e8764"
          },
          links: {
            twitter: "https://twitter.com/vtvlco",
            linkedIn: "https://www.linkedin.com/company/vtvl/",
            terms: "https://www.vtvl.io/terms",
            privacy: "https://www.vtvl.io/privacypolicy"
          }
        }
      }
    })
  });

  it('Go to ethereal again and login with the email/pw from the previous flow', () => {
    cy.visit('https://ethereal.email/messages');
    cy.visit('https://ethereal.email/login');
    cy.get('#address').type(email);
    cy.get('#password').type(password);
    cy.get('.btn:nth-child(1)').click();
    cy.visit('https://ethereal.email/messages');
    cy.contains("Login to VTVL");
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
  });

  it('Go to qa env using the captured URL', () => {
  cy.visit(capturedUrl);
  cy.wait(5000);
   });
  });
 });
});