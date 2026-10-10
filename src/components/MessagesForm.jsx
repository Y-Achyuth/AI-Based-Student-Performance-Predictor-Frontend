import { useMemo, useState } from 'react';
import { sendMessage } from '../api.js';
import { AlertMessage } from './shared.jsx';

export default function MessagesForm({ students }) {
  const [recipient, setRecipient] = useState('all');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const recipientCount = useMemo(() => {
    switch (recipient) {
      case 'at-risk': return students.filter((student) => student.interventionNeeded).length;
      case 'low-attendance': return students.filter((student) => student.attendanceRate < 75).length;
      case 'excellent': return students.filter((student) => student.status === 'excellent').length;
      default: return students.length;
    }
  }, [students, recipient]);

  async function submit(event) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setNotice({ type: 'danger', text: 'Please enter a message to send.' });
      return;
    }
    if (recipientCount === 0) {
      setNotice({ type: 'danger', text: 'There are no students in the selected group.' });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const result = await sendMessage({ recipient, message: trimmedMessage });
      setNotice({
        type: result.failed > 0 ? 'danger' : 'success',
        text: `SMS sent to ${result.sent} of ${result.total} recipients.${result.failed > 0 ? ` ${result.failed} failed.` : ''}`,
      });
      setMessage('');
    } catch (error) {
      setNotice({ type: 'danger', text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card app-card p-3 p-md-4">
      <div className="mb-4">
        <h2 className="section-title">Send SMS Notification</h2>
        <p className="text-muted small">Send custom text messages to students or parents using the configured Twilio integration.</p>
      </div>
      {notice && <AlertMessage variant={notice.type} className="mb-4">{notice.text}</AlertMessage>}
      <form onSubmit={submit} noValidate>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label htmlFor="message-recipient" className="form-label">Recipient Group <span className="text-danger">*</span></label>
            <select id="message-recipient" className="form-select" value={recipient} onChange={(event) => { setRecipient(event.target.value); setNotice(null); }}>
              <option value="all">All Students</option>
              <option value="at-risk">At-Risk Students (Intervention Needed)</option>
              <option value="low-attendance">Students with Low Attendance (&lt; 75%)</option>
              <option value="excellent">Excellent Performers</option>
            </select>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-end">
            <div className="alert alert-info py-2 px-3 mb-0 d-flex align-items-center">
              <i className="bi bi-person-lines-fill me-2" />
              <span>Sending to <strong>{recipientCount}</strong> recipients</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="message-content" className="form-label">SMS Message Body <span className="text-danger">*</span></label>
          <textarea id="message-content" className="form-control" rows="4" value={message} onChange={(event) => { setMessage(event.target.value); setNotice(null); }} placeholder="Type your text message here..." />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting || recipientCount === 0}>
          <i className={`bi ${submitting ? 'bi-hourglass-split' : 'bi-send'} me-1`} />
          {submitting ? 'Sending…' : 'Send SMS'}
        </button>
      </form>
    </section>
  );
}
