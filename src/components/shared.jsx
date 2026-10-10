export const SUBJECTS = [
  { key: 'cosm', label: 'Computer Oriented Statistical Methods' },
  { key: 'algorithms', label: 'Fundamentals of Computer Algorithms' },
  { key: 'dbms', label: 'Database Management Systems' },
  { key: 'python', label: 'Programming in Python' },
  { key: 'web-tech', label: 'Web Technologies' },
  { key: 'advanced-reading', label: 'Advanced Reading Comprehension Skills' },
  { key: 'aptitude', label: 'Quantitative Aptitude and Logical Reasoning - II' },
  { key: 'project', label: 'Integrated Project - II' },
];

export const ASSESSMENT_TYPES = [
  { value: 'mid1', label: 'Mid 1' },
  { value: 'mid2', label: 'Mid 2' },
  { value: 'unit 1 test', label: 'Unit 1 Test' },
  { value: 'unit3 test', label: 'Unit 3 Test' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'final', label: 'Final' },
];

export function today() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function StatusBadge({ status }) {
  const statusMap = {
    'at-risk': ['badge-atrisk', 'At Risk'],
    average: ['badge-average', 'Average'],
    excellent: ['badge-excellent', 'Excellent'],
  };
  const [className, label] = statusMap[status] || ['badge-average', status || 'Unknown'];
  return <span className={`badge rounded-pill ${className}`}>{label}</span>;
}

export function ProgressBar({ value, color = 'bg-primary' }) {
  const safeValue = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div className="progress-sm mt-1" aria-label={`${safeValue}%`}>
      <div className={`progress-bar ${color}`} style={{ width: `${safeValue}%`, height: '100%' }} />
    </div>
  );
}

export function MetricCard({ label, value, valueClass = '', cardClass = '' }) {
  return (
    <div className="col-6 col-md-3">
      <div className={`card app-card p-3 ${cardClass}`}>
        <div className="card-label">{label}</div>
        <div className={`card-value ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

export function AlertMessage({ variant = 'danger', children, className = '' }) {
  return (
    <div className={`alert alert-${variant} d-flex align-items-center ${className}`} role="status">
      <i className={`bi ${variant === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'} me-2`} />
      <span>{children}</span>
    </div>
  );
}

export function PerformanceCell({ student }) {
  return (
    <>
      <div className={`fw-semibold small ${performanceColor(student.performanceScore)}`}>
        {student.performanceScore}%
      </div>
      <ProgressBar value={student.performanceScore} />
    </>
  );
}

export function performanceColor(score) {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  if (score >= 40) return 'text-warning';
  return 'text-danger';
}

export function performanceLevel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Critical';
}

export function TrendIcon({ trend }) {
  if (trend === 'improving') return <i className="bi bi-trending-up trend-up" aria-label="Improving" />;
  if (trend === 'declining') return <i className="bi bi-trending-down trend-down" aria-label="Declining" />;
  return <i className="bi bi-dash text-secondary" aria-label={trend || 'Stable'} />;
}

export function EmptyTableRow({ columns, children = 'No students to display.' }) {
  return (
    <tr>
      <td colSpan={columns} className="text-center text-muted py-4">{children}</td>
    </tr>
  );
}
