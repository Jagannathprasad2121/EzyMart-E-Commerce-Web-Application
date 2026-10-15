import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Support.css';

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL?.trim();

const SupportLayout = ({ eyebrow, title, intro, children }) => (
  <main className="support-page">
    <div className="support-container">
      <header className="support-heading">
        <p className="support-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      {children}
    </div>
  </main>
);

export const Contact = () => {
  const [notice, setNotice] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!supportEmail) {
      setNotice('Customer support email is not configured yet. Please use the FAQs or My Orders page for help.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const subject = `[EzyMart support] ${form.get('topic')}`;
    const body = [
      `Name: ${form.get('name')}`,
      `Email: ${form.get('email')}`,
      '',
      'Message:',
      form.get('message'),
    ].join('\n');

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNotice('Your email app should open with the support message. Review it and send it to contact support.');
  };

  return (
    <SupportLayout
      eyebrow="WE ARE HERE TO HELP"
      title="Contact EzyMart"
      intro="Tell us what you need help with. For order questions, include your order number and use the same email address as your account."
    >
      <div className="support-contact-grid">
        <section className="support-card support-contact-info">
          <span className="support-card-icon" aria-hidden="true">✉</span>
          <h2>Email support</h2>
          {supportEmail ? (
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          ) : (
            <p>Support email is not configured for this installation.</p>
          )}
          <p>The form opens your email app. It does not send or store a message on this website.</p>
          <Link to="/faq">Browse frequently asked questions <span aria-hidden="true">→</span></Link>
        </section>

        <section className="support-card">
          <h2>Send a message</h2>
          <form className="support-form" onSubmit={handleSubmit}>
            <label htmlFor="support-name">Your name</label>
            <input id="support-name" name="name" autoComplete="name" required maxLength={100} />

            <label htmlFor="support-email">Email address</label>
            <input id="support-email" name="email" type="email" autoComplete="email" required maxLength={254} />

            <label htmlFor="support-topic">What can we help with?</label>
            <select id="support-topic" name="topic" defaultValue="Order question">
              <option>Order question</option>
              <option>Product question</option>
              <option>Account help</option>
              <option>Other</option>
            </select>

            <label htmlFor="support-message">Message</label>
            <textarea id="support-message" name="message" rows="5" required maxLength={3000} />
            <p className="support-form-hint">Please do not include your password or full payment details.</p>
            <button type="submit" className="support-button">Open email app</button>
            {notice && <p className="support-notice" role="status">{notice}</p>}
          </form>
        </section>
      </div>
    </SupportLayout>
  );
};

const faqItems = [
  {
    question: 'How do I place an order?',
    answer: <>Browse the <Link to="/products">product catalogue</Link>, add products to your cart, and continue to checkout. Enter your delivery address and submit the order.</>,
  },
  {
    question: 'How do I check my order status?',
    answer: <>Sign in and open <Link to="/myorders">My Orders</Link> to see your order details and current fulfilment status.</>,
  },
  {
    question: 'Why is my cart still here after refreshing?',
    answer: 'Your cart is saved in this browser so it can survive a refresh. Signing out clears the saved cart. Cart contents are not synced between devices.',
  },
  {
    question: 'Can I change my profile or delivery address?',
    answer: 'The current account page is read-only, and saved address management is not available. Contact support for account questions; checkout accepts a delivery address for each order.',
  },
  {
    question: 'Are payments processed through Razorpay?',
    answer: 'Checkout currently uses a simulated payment flow. It does not charge a card or complete a real Razorpay transaction.',
  },
  {
    question: 'How do returns or refunds work?',
    answer: 'Self-service return and refund tools are not available in this version. Contact support with your order number to discuss an order issue.',
  },
  {
    question: 'What should I do if I cannot sign in?',
    answer: 'Check that you verified your email address and are using the correct email and password. If the problem continues, contact support without sharing your password.',
  },
];

export const FAQ = () => (
  <SupportLayout
    eyebrow="CUSTOMER SUPPORT"
    title="Frequently asked questions"
    intro="Quick answers about shopping, accounts, orders, and checkout on EzyMart."
  >
    <section className="support-faq-list" aria-label="Frequently asked questions">
      {faqItems.map(({ question, answer }) => (
        <details className="support-faq-item" key={question}>
          <summary>{question}<span aria-hidden="true">＋</span></summary>
          <div className="support-faq-answer"><p>{answer}</p></div>
        </details>
      ))}
    </section>
    <div className="support-callout">
      <div><h2>Still need help?</h2><p>Send the support team a message and include your order number when relevant.</p></div>
      <Link className="support-button" to="/contact">Contact support</Link>
    </div>
  </SupportLayout>
);

export const Privacy = () => (
  <SupportLayout
    eyebrow="INFORMATION"
    title="Privacy overview"
    intro="This page describes how the current EzyMart application handles information. Review and update it before using this project as a live store policy."
  >
    <article className="support-policy">
      <section><h2>Information used by the app</h2><p>EzyMart uses account details such as your name and email address to support registration and sign-in. Email verification codes are used during account verification. When you place an order, the app stores its items, delivery address, total, and fulfilment status.</p></section>
      <section><h2>Browser storage</h2><p>The client stores your sign-in token and shopping cart in this browser. The cart is cleared when you sign out. Clearing browser storage will also remove locally saved session and cart data.</p></section>
      <section><h2>Payments and product images</h2><p>The current checkout is simulated and does not collect card details or charge a payment provider. Product images are hosted through Cloudinary as configured by the store.</p></section>
      <section><h2>Protection and contact</h2><p>Passwords are hashed by the server, and email verification codes are stored as hashes with an expiry. No online service can promise absolute security. For privacy questions, use the <Link to="/contact">Contact page</Link>.</p></section>
      <p className="support-policy-note">This overview reflects the current project behavior and is not a substitute for a jurisdiction-specific privacy notice.</p>
    </article>
  </SupportLayout>
);

export const Terms = () => (
  <SupportLayout
    eyebrow="INFORMATION"
    title="Terms and conditions"
    intro="These terms summarize the current EzyMart demo experience. A store operator should review and replace them before a public commercial launch."
  >
    <article className="support-policy">
      <section><h2>Using EzyMart</h2><p>Use the application lawfully and provide accurate account, checkout, and delivery information. Keep your sign-in credentials private and contact support if you suspect unauthorized access.</p></section>
      <section><h2>Products and availability</h2><p>Product descriptions, prices, images, and stock are provided for the application experience. The server checks product details and stock when processing an order; availability can change.</p></section>
      <section><h2>Orders and payment</h2><p>Submitting checkout creates an order in the current application. Payment is simulated and no real payment is collected. Do not treat an order confirmation in this demo as proof of a real charge or shipment.</p></section>
      <section><h2>Accounts and support</h2><p>Protected features require an account. The current profile is read-only, and self-service returns, refunds, and address management are not implemented. For questions, visit <Link to="/contact">Contact support</Link>.</p></section>
      <p className="support-policy-note">These project terms are informational and should be reviewed for the laws and practices of any real store deployment.</p>
    </article>
  </SupportLayout>
);
