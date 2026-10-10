import { useMemo, useState } from 'react';
import {
  EmptyTableRow,
  MetricCard,
  PerformanceCell,
  ProgressBar,
  TrendIcon,
  performanceColor,
  performanceLevel,
} from './shared.jsx';

const ASSESSMENT_TYPES = ['mid1', 'mid2', 'unit 1 test', 'unit3 test', 'assessment', 'final'];

function AssessmentMatrix({ student }) {
  const scores = new Map();
  (student.recentAssessments || []).forEach((assessment) => {
    const key = `${assessment.subject}|${assessment.type}`;
    scores.set(key, assessment.score);
  });

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-sm align-middle text-center mt-3">
        <thead className="table-light">
          <tr><th className="text-start">Subject</th>{ASSESSMENT_TYPES.map((type) => <th key={type} className="text-capitalize">{type}</th>)}</tr>
        </thead>
        <tbody>
          {[
            ['cosm', 'Computer Oriented Statistical Methods'],
            ['algorithms', 'Fundamentals of Computer Algorithms'],
            ['dbms', 'Database Management Systems'],
            ['python', 'Programming in Python'],
            ['web-tech', 'Web Technologies'],
            ['advanced-reading', 'Advanced Reading Comprehension Skills'],
            ['aptitude', 'Quantitative Aptitude and Logical Reasoning - II'],
            ['project', 'Integrated Project - II'],
          ].map(([key, label]) => (
            <tr key={key}>
              <td className="text-start fw-medium">{label}</td>
              {ASSESSMENT_TYPES.map((type) => (
                <td key={type}>{scores.get(`${label}|${type}`) ?? scores.get(`${key}|${type}`) ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StudentDetails({ student }) {
  if (!student) return null;
  const attendanceClass = student.attendanceRate >= 75 ? 'text-success' : 'text-warning';

  return (
    <section className="card app-card p-3 p-md-4 border-primary monitor-details">
      <h3 className="fs-5 fw-semibold mb-4">Detailed Analysis: {student.name}</h3>
      <div className="row g-3 mb-4">
        <div className="col-md-4"><p className="text-muted small mb-0">Roll Number</p><p className="fw-semibold fs-5">{student.rollNo}</p></div>
        <div className="col-md-4">
          <p className="text-muted small mb-0">Current Status</p>
          <span className={`badge rounded-pill ${student.interventionNeeded ? 'bg-danger' : 'bg-secondary'}`}>
            {student.interventionNeeded ? 'Needs Intervention' : 'On Track'}
          </span>
        </div>
        <div className="col-md-4">
          <p className="text-muted small mb-0">Performance Trend</p>
          <div className="d-flex align-items-center gap-2"><TrendIcon trend={student.trend} /><span className="fw-medium text-capitalize">{student.trend || 'stable'}</span></div>
        </div>
      </div>
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="small fw-medium">Performance Score: {student.performanceScore}%</span>
              <span className={`small fw-semibold ${performanceColor(student.performanceScore)}`}>{performanceLevel(student.performanceScore)}</span>
            </div>
            <ProgressBar value={student.performanceScore} />
          </div>
          <div>
            <div className="d-flex justify-content-between mb-1">
              <span className="small fw-medium">Attendance Rate: {student.attendanceRate}%</span>
              <span className={`small fw-semibold ${attendanceClass}`}>{student.attendanceRate >= 75 ? 'Good' : 'Needs Improvement'}</span>
            </div>
            <ProgressBar value={student.attendanceRate} color="bg-info" />
          </div>
        </div>
        <div className="col-md-6">
          <p className="fw-medium mb-2">Risk Factors:</p>
          {student.riskFactors?.length
            ? student.riskFactors.map((factor) => <div className="risk-factor-item" key={factor}><i className="bi bi-exclamation-circle-fill" />{factor}</div>)
            : <p className="text-muted small">No risk factors identified.</p>}
        </div>
      </div>
      <div>
        <p className="fw-medium mb-2">Recent Assessments</p>
        <AssessmentMatrix student={student} />
      </div>
    </section>
  );
}

export default function Monitor({ students }) {
  const [search, setSearch] = useState('');
  const [riskOnly, setRiskOnly] = useState(false);
  const [selected, setSelected] = useState(null);
  const atRiskCount = students.filter((student) => student.interventionNeeded).length;
  const excellentCount = students.filter((student) => student.status === 'excellent').length;
  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = student.name?.toLowerCase().includes(normalizedSearch)
        || student.rollNo?.toLowerCase().includes(normalizedSearch);
      return matchesSearch && (!riskOnly || student.interventionNeeded);
    });
  }, [students, search, riskOnly]);

  return (
    <>
      <div className="row g-3 mb-4">
        <MetricCard label="Total Students" value={students.length} />
        <MetricCard label="Needs Intervention" value={atRiskCount} valueClass="text-danger" cardClass="bg-danger-subtle" />
        <MetricCard label="Excellent" value={excellentCount} valueClass="text-success" cardClass="bg-success-subtle" />
      </div>
      <section className="card app-card p-3 p-md-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-6">
            <label htmlFor="monitor-search" className="form-label">Search Student</label>
            <input id="monitor-search" className="form-control" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or roll number..." />
          </div>
          <div className="col-md-6">
            <button type="button" className={`btn w-100 ${riskOnly ? 'btn-secondary' : 'btn-outline-secondary'}`} onClick={() => setRiskOnly((current) => !current)}>
              {riskOnly ? 'Show All Students' : 'Show At-Risk Students'}
            </button>
          </div>
        </div>
      </section>
      {atRiskCount > 0 && (
        <div className="alert alert-danger d-flex align-items-center mb-4" role="status">
          <i className="bi bi-exclamation-circle-fill me-2" />
          <span>{atRiskCount} student{atRiskCount === 1 ? '' : 's'} need immediate intervention to prevent further academic decline.</span>
        </div>
      )}
      <section className="card app-card p-3 p-md-4 mb-4">
        <h3 className="fs-5 fw-semibold mb-3">Student List ({filteredStudents.length})</h3>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Name</th><th>Roll No</th><th>Performance</th><th>Attendance</th><th>Status</th><th>Trend</th><th>Action</th></tr></thead>
            <tbody>
              {filteredStudents.length === 0 && <EmptyTableRow columns={7} />}
              {filteredStudents.map((student) => (
                <tr key={student.id || student.rollNo} className={student.interventionNeeded ? 'row-intervention' : ''}>
                  <td className="fw-medium">{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td><PerformanceCell student={student} /></td>
                  <td><div className="fw-medium small">{student.attendanceRate}%</div><ProgressBar value={student.attendanceRate} color="bg-info" /></td>
                  <td><span className={`badge rounded-pill ${student.interventionNeeded ? 'bg-danger' : 'bg-secondary'}`}>{student.interventionNeeded ? 'At Risk' : 'On Track'}</span></td>
                  <td><TrendIcon trend={student.trend} /></td>
                  <td><button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setSelected(student)}>View Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <StudentDetails student={selected} />
    </>
  );
}
