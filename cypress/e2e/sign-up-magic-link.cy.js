import 'cypress-iframe'

before(function () {
  return cy
    .mailslurp()
    .then((mailslurp) => mailslurp.createInbox())
    .then((inbox) => {
      cy.wrap(inbox.id).as('inboxId')
      cy.wrap(inbox.emailAddress).as('emailAddress')
    })
})

it('can access values on this', function () {
  expect(this.emailAddress).to.contain('@mailslurp')
})

it('sign up', function () {
  cy.log(this.emailAddress)
  cy.visit('/onboarding/sign-up')
  cy.get('.input-component__input').type(this.emailAddress)
  cy.get('.text-xs > .flex-row > .flex').click()
})
