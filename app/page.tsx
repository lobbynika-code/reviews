"use client";

import { FormEvent, useState } from "react";

type ReviewState = "idle" | "sending" | "success" | "error";

export default function Home() {
  const [rating, setRating] = useState(0);
  const [requestCallback, setRequestCallback] = useState(false);
  const [state, setState] = useState<ReviewState>("idle");
  const [error, setError] = useState("");

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      rating,
      experience: String(form.get("experience") || ""),
      improvement: String(form.get("improvement") || ""),
      customerName: String(form.get("customerName") || ""),
      phone: String(form.get("phone") || ""),
      requestCallback,
      // Honeypot field: real visitors should leave this empty.
      website: String(form.get("website") || ""),
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We couldn't submit your review.");
      setState("success");
      setRating(0);
      setRequestCallback(false);
      event.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <main className="page-shell">
        <section className="success-card">
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">NAFASS B.</p>
          <h1>Thank you for your feedback.</h1>
          <p>Your review has been received. Your feedback helps us serve you better.</p>
          <button className="button button-primary" onClick={() => setState("idle")}>Submit another review</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="brand">
        <div className="brand-mark">N.</div>
        <div><span className="brand-name">NAFASS B.</span><span className="brand-caption">CUSTOMER EXPERIENCE</span></div>
      </header>

      <section className="intro">
        <p className="eyebrow">YOUR VOICE MATTERS</p>
        <h1>How was your experience?</h1>
        <p className="intro-copy">We appreciate you choosing Nafass B. Tell us what went well and where we can do better. Your honest feedback helps us improve.</p>
      </section>

      <form className="review-form" onSubmit={submitReview}>
        <section className="form-section">
          <label className="field-label">How would you rate your experience? <span className="required">*</span></label>
          <div className="stars" role="radiogroup" aria-label="Overall rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button key={value} type="button" className={value <= rating ? "star selected" : "star"} onClick={() => setRating(value)} role="radio" aria-checked={rating === value} aria-label={`${value} out of 5 stars`}>★</button>
            ))}
          </div>
          <p className="field-hint">{rating ? ["", "Not good", "Could be better", "Okay", "Very good", "Excellent"][rating] : "Select a rating from 1 to 5"}</p>
        </section>

        <section className="form-section">
          <label className="field-label" htmlFor="experience">Tell us about your experience <span className="required">*</span></label>
          <textarea id="experience" name="experience" required minLength={5} maxLength={3000} rows={4} placeholder="What did you enjoy? What stood out to you?" />
        </section>

        <section className="form-section">
          <label className="field-label" htmlFor="improvement">What do you think we should improve?</label>
          <textarea id="improvement" name="improvement" maxLength={3000} rows={4} placeholder="Your suggestions help us get better..." />
        </section>

        <section className="form-section contact-section">
          <div>
            <h2>Would you like a manager to contact you?</h2>
            <p className="field-hint">This is optional. You can leave your feedback without sharing your details.</p>
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={requestCallback} onChange={(event) => setRequestCallback(event.target.checked)} />
            <span>Yes, I would like a manager to speak with me</span>
          </label>
          {requestCallback && (
            <div className="contact-fields">
              <div>
                <label className="field-label" htmlFor="customerName">Your name</label>
                <input id="customerName" name="customerName" type="text" autoComplete="name" maxLength={120} placeholder="Your name" />
              </div>
              <div>
                <label className="field-label" htmlFor="phone">Phone number <span className="required">*</span></label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" required={requestCallback} maxLength={40} placeholder="e.g. 024 000 0000" />
              </div>
            </div>
          )}
        </section>

        <div className="privacy-note"><span aria-hidden="true">🔒</span><p>Your contact details are only shared with Nafass B. management to respond to your callback request. Your email address is not required.</p></div>

        <input className="website-field" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {error && <p className="error-message" role="alert">{error}</p>}
        <button className="button button-primary submit-button" type="submit" disabled={state === "sending" || rating === 0}>
          {state === "sending" ? "Submitting..." : "Submit my review"}
        </button>
        <p className="form-footnote">Fields marked with * are required.</p>
      </form>

      <footer className="footer">Thank you for helping Nafass B. do better.</footer>
    </main>
  );
}
