/// <reference types="cypress" />
/// <reference types="cypress-axe" />

describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the main navigation', () => {
    cy.get('nav').should('be.visible');
    cy.get('nav').contains('Home');
    cy.get('nav').contains('Products');
    cy.get('nav').contains('About');
  });

  it('shows featured products', () => {
    cy.get('[data-testid="featured-products"]').should('be.visible');
    cy.get('[data-testid="product-card"]').should('have.length.at.least', 1);
  });

  it('allows adding products to cart', () => {
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-cart"]').click();
    });
    cy.get('[data-testid="cart-count"]').should('be.visible');
  });

  it('allows adding products to wishlist', () => {
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="add-to-wishlist"]').click();
    });
    cy.get('[data-testid="wishlist-count"]').should('be.visible');
  });

  it('has working search functionality', () => {
    cy.get('[data-testid="search-input"]').type('printable');
    cy.get('[data-testid="search-results"]').should('be.visible');
  });

  it('maintains accessibility standards', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
}); 