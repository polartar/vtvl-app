describe('Sign up - Magic link', () => {
  const serverId = 'mpbo6qs9';
  const testEmail = `${Date.now()}@${serverId}.mailosaur.net`;
  let passwordResetLink;

  // Function to extract the link from the email body
function extractLinkFromEmail(body) {
  // Implement your logic to extract the link from the email body
  // You can use regular expressions, HTML parsing libraries, or other methods depending on the email format
  // For example, if the link is within an <a> tag, you can use a regular expression to extract it
  const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/;
  const match = body.match(regex);
  if (match && match[2]) {
    return match[2];
  }
  return null; // Return null if no link is found
}

  it('Sign up', () => {
    cy.visit('/onboarding/sign-up');
    cy.get('.input-component__input').type(testEmail);
    cy.get('.text-xs > .flex-row > .flex').click();
    cy.contains('Create account').click();
    cy.wait(30000)

  });
/*
  it('Gets a Magic Link email', () => {
    cy.mailosaurGetMessage(serverId, {
      sentTo: testEmail
    }).then(email => {
      expect(email.subject).to.equal('Login to VTVL');
      passwordResetLink = email.text.links[0].href;
      cy.log(passwordResetLink);
      cy.get('body')
        .find('a:contains("Sign in now!")')
        .invoke('attr', 'href')
        .then((passwordResetLink) => {
          cy.log(`URL captured: ${passwordResetLink}`);
          cy.visit(passwordResetLink, { log: true });
        });
    });
  });
});*/

  // Fetch the email message
 /* cy.mailosaurSearchMessages(serverId, {
    sentTo: testEmail,
    subject: 'Login to VTVL'
  }).then(messages => {
    // Check if any matching messages were found
    if (messages.length > 0) {
      const email = messages[0];

      // Extract the link URL from the email body
      passwordResetLink = extractLinkFromEmail(email.body);
      cy.log(passwordResetLink);
    } else {
      // Handle the scenario when no matching email is found
      cy.log('No matching email found.');
    } 

    cy.mailosaurGetMessage(serverId, {
      sentTo: testEmail
    }).then(email => {
      cy.wait(30000)
      expect(email.subject).to.equal('Login to VTVL');
      passwordResetLink = email.text.links[0].href;
      cy.log(passwordResetLink);
      cy.wait(30000)

  if (passwordResetLink) {
    cy.visit({
      url: passwordResetLink,
      log: true
    });
  } else {
    cy.log('No link found in the email body.');
  }
  cy.wait(30000)

});
});

});
*/

it('Verify email and visit the link', () => {
  cy.mailosaurGetMessage(serverId, {
    sentTo: testEmail
  }).then(email => {
    cy.wait(30000);
    expect(email.subject).to.equal('Login to VTVL');
    passwordResetLink = email.text.links[0].href;
    cy.log(passwordResetLink);
    cy.wait(30000);

    if (passwordResetLink) {
      cy.visit(passwordResetLink, { log: true });
    } else {
      cy.log('No link found in the email body.');
    }
    cy.wait(30000);
  });
});
});
