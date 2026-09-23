"use client";

import { FormEvent, useState } from "react";
import config from "@/config.json";
import { CheckIcon } from "./icons";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="form-success">
        <span className="success-icon"><CheckIcon size={23} /></span>
        <span className="eyebrow">Message received</span>
        <h3>We’ll be in touch shortly.</h3>
        <p>Thanks for sharing a little about your operation. A member of the Logistra team will follow up with the right next step.</p>
        <button className="text-link" onClick={() => setSubmitted(false)}>Send another enquiry</button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Full name <input name="name" required placeholder="Your name" /></label>
        <label>Business name <input name="business" required placeholder="Your business" /></label>
      </div>
      <div className="form-row">
        <label>Email address <input name="email" type="email" required placeholder="you@business.com" /></label>
        <label>Phone number <input name="phone" type="tel" required placeholder="+91" /></label>
      </div>
      <div className="form-row">
        <label>Monthly orders <select name="orders" required defaultValue=""><option value="" disabled>Select a range</option>{config.contact.orderRanges.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Number of SKUs <input name="skus" required placeholder="Approx. count" /></label>
      </div>
      <div className="form-row">
        <label>Selling channels <select name="channel" required defaultValue=""><option value="" disabled>Select a channel</option>{config.contact.channels.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Product category <select name="category" required defaultValue=""><option value="" disabled>Select a category</option>{config.contact.categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label>Tell us about your current setup <textarea name="message" placeholder="What is working, and where does fulfilment get difficult?" rows={4} /></label>
      <div className="form-submit-row">
        <button className="button button-dark" type="submit">Get my fulfilment assessment <span>↗</span></button>
        <span className="form-privacy">We’ll only use these details to reply to your enquiry.</span>
      </div>
    </form>
  );
}
