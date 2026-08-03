import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import TextField from '@mui/material/TextField';
import '../assets/styles/Contact.scss';

const EMAIL = 'joseph.nguyen010@gmail.com';

// Read at build time. CRA inlines these into the bundle, so they are public by
// design — EmailJS issues a publishable key precisely for this use.
const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

type Status = 'idle' | 'sending' | 'sent' | 'error';

function Contact() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const [nameError, setNameError] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<boolean>(false);

  const [status, setStatus] = useState<Status>('idle');

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingName = name.trim() === '';
    const missingEmail = email.trim() === '';
    const missingMessage = message.trim() === '';

    setNameError(missingName);
    setEmailError(missingEmail);
    setMessageError(missingMessage);

    if (missingName || missingEmail || missingMessage) return;

    // Never pretend to send. If the keys are absent, say so and point at the
    // mailto instead of swallowing the message.
    if (!isConfigured) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      await emailjs.send(
        SERVICE_ID as string,
        TEMPLATE_ID as string,
        { name, email, message },
        { publicKey: PUBLIC_KEY as string }
      );
      setStatus('sent');
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div id="contact">
      <div className="items-container">
        <div className="contact_wrapper">
          <h1>Contact Me</h1>
          <p>
            Always happy to talk about product, data, or anything I'm building.
            Send a note below, or email me directly at{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>

          <Box
            component="form"
            noValidate
            autoComplete="off"
            className="contact-form"
            onSubmit={sendEmail}
          >
            {/* Labels are plain elements above each field rather than MUI's
                floating variant, which lands on the border and straddles the
                white field and the dark page. */}
            <div className="form-flex">
              <div className="field">
                <label htmlFor="contact-name">Your Name</label>
                <TextField
                  required
                  id="contact-name"
                  placeholder="What's your name?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={nameError}
                  helperText={nameError ? 'Please enter your name' : ''}
                />
              </div>
              <div className="field">
                <label htmlFor="contact-email">Email / Phone</label>
                <TextField
                  required
                  id="contact-email"
                  placeholder="How can I reach you?"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                  helperText={emailError ? 'Please enter your email or phone number' : ''}
                />
              </div>
            </div>

            <div className="field body-form">
              <label htmlFor="contact-message">Message</label>
              <TextField
                required
                id="contact-message"
                placeholder="Send me any inquiries or questions"
                multiline
                rows={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={messageError}
                helperText={messageError ? 'Please enter the message' : ''}
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending...' : 'Send'}
            </Button>

            {/* aria-live so the outcome is announced, not just shown. */}
            <p className={`form-status is-${status}`} role="status" aria-live="polite">
              {status === 'sent' && 'Thanks. Your message is on its way.'}
              {status === 'error' && (
                <>
                  Something went wrong sending that. Please email me directly at{' '}
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
                </>
              )}
            </p>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default Contact;
