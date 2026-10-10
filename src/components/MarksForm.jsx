import { useState } from 'react';
import { saveAssessment } from '../api.js';
import { AlertMessage, ASSESSMENT_TYPES, SUBJECTS, today } from './shared.jsx';

const DEFAULT_MAX_SCORES = {
  mid1: 20,
  mid2: 20,
  'unit 1 test': 20,
  'unit3 test': 20,
  assessment: 10,
  final: 50,
};

export default function MarksForm() {
  const [form, setForm] = useState({
    rollNo: '',
    assessmentType: 'mid1',
    subject: 'cosm',
    date: today(),
    score: '',
    maxScore: '20',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const percentage = Number(form.maxScore) > 0
    ? ((Number(form.score || 0) / Number(form.maxScore)) * 100).toFixed(2)
    : '0.00';

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'assessmentType' ? { maxScore: String(DEFAULT_MAX_SCORES[value] || current.maxScore) } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    const score = Number(form.score);
    const maxScore = Number(form.maxScore);
    const nextErrors = {};
    if (!/^[A-Z0-9]+$/.test(form.rollNo.trim().toUpperCase())) nextErrors.rollNo = 'Enter a valid alphanumeric roll number.';
    if (form.score === '' || !Number.isFinite(score) || score < 0) nextErrors.score = 'Enter a non-negative score.';
    if (form.maxScore === '' || !Number.isFinite(maxScore) || maxScore <= 0) nextErrors.maxScore = 'Max marks must be greater than 0.';
    if (Number.isFinite(score) && Number.isFinite(maxScore) && score > maxScore) nextErrors.score = `Marks cannot exceed ${form.maxScore}.`;
    if (!form.date) nextErrors.date = 'Date is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setMessage('');
    try {
      await saveAssessment({
        rollNo: form.rollNo.trim().toUpperCase(),
        assessmentType: form.assessmentType,
        subject: form.subject,
        score,
        maxScore,
      });
      setMessage('Marks recorded successfully.');
      setForm((current) => ({ ...current, rollNo: '', date: today(), score: '', maxScore: '100' }));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card app-card p-3 p-md-4">
      <div className="mb-3">
        <h2 className="section-title">Enter Marks &amp; Assessments</h2>
        <p className="text-muted small">Record marks for individual subjects and assessments.</p>
      </div>
      {message && <AlertMessage variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-3">{message}</AlertMessage>}
      <form onSubmit={submit} noValidate>
        <div className="row g-3 mb-3">
          <div className="col-12">
            <label htmlFor="marks-rollNo" className="form-label">Roll Number <span className="text-danger">*</span></label>
            <input id="marks-rollNo" name="rollNo" className={`form-control ${errors.rollNo ? 'is-invalid' : ''}`} value={form.rollNo} onChange={updateField} placeholder="Enter roll number" autoComplete="off" />
            {errors.rollNo && <div className="invalid-feedback">{errors.rollNo}</div>}
          </div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <label htmlFor="marks-type" className="form-label">Assessment Type <span className="text-danger">*</span></label>
            <select id="marks-type" name="assessmentType" className="form-select" value={form.assessmentType} onChange={updateField}>
              {ASSESSMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="marks-subject" className="form-label">Subject <span className="text-danger">*</span></label>
            <select id="marks-subject" name="subject" className="form-select" value={form.subject} onChange={updateField}>
              {SUBJECTS.map((subject) => <option key={subject.key} value={subject.key}>{subject.label}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label htmlFor="marks-date" className="form-label">Date <span className="text-danger">*</span></label>
            <input id="marks-date" type="date" name="date" className={`form-control ${errors.date ? 'is-invalid' : ''}`} value={form.date} onChange={updateField} />
            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
          </div>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label htmlFor="marks-score" className="form-label">Marks Obtained <span className="text-danger">*</span></label>
            <input id="marks-score" type="number" min="0" step="0.5" name="score" className={`form-control ${errors.score ? 'is-invalid' : ''}`} value={form.score} onChange={updateField} placeholder="0" />
            {errors.score && <div className="invalid-feedback">{errors.score}</div>}
          </div>
          <div className="col-md-4">
            <label htmlFor="marks-maxScore" className="form-label">Max Marks <span className="text-danger">*</span></label>
            <input id="marks-maxScore" type="number" min="0.01" step="any" name="maxScore" className={`form-control ${errors.maxScore ? 'is-invalid' : ''}`} value={form.maxScore} onChange={updateField} />
            {errors.maxScore && <div className="invalid-feedback">{errors.maxScore}</div>}
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="marks-percentage">Percentage</label>
            <output id="marks-percentage" className="form-control bg-light fw-semibold">{percentage}%</output>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? 'Recording…' : 'Record Marks & Assessment'}
        </button>
      </form>
    </section>
  );
}
