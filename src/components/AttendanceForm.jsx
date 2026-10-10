import { useEffect, useMemo, useState } from 'react';
import { saveAttendance } from '../api.js';
import { AlertMessage, today } from './shared.jsx';

function shortRoll(rollNo = '') {
  const upper = rollNo.toUpperCase();
  const index = ['LEK', 'LE', 'K'].map((prefix) => upper.indexOf(prefix)).find((position) => position >= 0);
  return index === undefined ? upper.slice(-3) : upper.slice(index);
}

export default function AttendanceForm({ students, onSaved }) {
  const [date, setDate] = useState(today());
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    setRecords(students.map((student) => ({
      rollNo: student.rollNo,
      studentName: student.name,
      status: 'present',
    })));
  }, [students]);

  const presentCount = useMemo(() => records.filter((record) => record.status === 'present').length, [records]);
  const absentCount = records.length - presentCount;

  function toggleRecord(rollNo) {
    setRecords((current) => current.map((record) => (
      record.rollNo === rollNo
        ? { ...record, status: record.status === 'present' ? 'absent' : 'present' }
        : record
    )));
    setMessage('');
  }

  async function submit(event) {
    event.preventDefault();
    setShowValidation(true);
    if (!date || records.length === 0) return;

    setSubmitting(true);
    setMessage('');
    try {
      await saveAttendance({ date, records: records.map(({ rollNo, status }) => ({ rollNo, status })) });
      setMessage('Attendance recorded successfully.');
      await onSaved();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card app-card p-3 p-md-4">
      <div className="mb-3">
        <h2 className="section-title">Attendance Tracking</h2>
        <p className="text-muted small">Mark daily attendance for all students.</p>
      </div>
      {message && <AlertMessage variant={message.includes('successfully') ? 'success' : 'danger'} className="mb-3">{message}</AlertMessage>}
      <form onSubmit={submit} noValidate>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label htmlFor="attendance-date" className="form-label">Attendance Date <span className="text-danger">*</span></label>
            <input id="attendance-date" type="date" className={`form-control ${showValidation && !date ? 'is-invalid' : ''}`} value={date} onChange={(event) => setDate(event.target.value)} />
            {showValidation && !date && <div className="invalid-feedback">Date is required.</div>}
          </div>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-6">
            <div className="card app-card p-3 bg-success-subtle text-center">
              <div className="card-label fw-bold">Present</div>
              <div className="card-value text-success fs-3">{presentCount}</div>
            </div>
          </div>
          <div className="col-6">
            <div className="card app-card p-3 bg-danger-subtle text-center">
              <div className="card-label fw-bold">Absent</div>
              <div className="card-value text-danger fs-3">{absentCount}</div>
            </div>
          </div>
        </div>
        {showValidation && records.length === 0 && (
          <AlertMessage className="mb-3">Students could not be loaded, so attendance cannot be submitted.</AlertMessage>
        )}
        {students.length > 0 && (
          <div className="d-flex flex-wrap gap-3 justify-content-center mb-4">
            {records.map((record) => (
              <button
                key={record.rollNo}
                type="button"
                className={`attendance-box rounded shadow-sm ${record.status === 'present' ? 'bg-success' : 'bg-danger'}`}
                title={`${record.studentName}: ${record.status}`}
                aria-label={`${record.studentName}, ${record.status}. Toggle attendance`}
                aria-pressed={record.status === 'present'}
                onClick={() => toggleRecord(record.rollNo)}
              >
                {shortRoll(record.rollNo)}
              </button>
            ))}
          </div>
        )}
        <button type="submit" className="btn btn-primary w-100" disabled={submitting || students.length === 0}>
          {submitting ? 'Submitting…' : 'Submit Attendance'}
        </button>
      </form>
    </section>
  );
}
