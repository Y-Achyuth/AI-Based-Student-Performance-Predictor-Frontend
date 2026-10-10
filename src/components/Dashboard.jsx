import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import {
  EmptyTableRow,
  MetricCard,
  PerformanceCell,
  ProgressBar,
  StatusBadge,
} from './shared.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function Dashboard({ students, theme }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const summary = useMemo(() => {
    const average = students.length
      ? (students.reduce((total, student) => total + student.performanceScore, 0) / students.length).toFixed(1)
      : '0.0';
    return {
      atRisk: students.filter((student) => student.status === 'at-risk').length,
      excellent: students.filter((student) => student.status === 'excellent').length,
      average,
    };
  }, [students]);

  const chartData = {
    labels: ['Excellent', 'Average', 'At Risk'],
    datasets: [{
      data: [
        summary.excellent,
        students.filter((student) => student.status === 'average').length,
        summary.atRisk,
      ],
      backgroundColor: ['rgba(16, 185, 129, 0.75)', 'rgba(79, 70, 229, 0.75)', 'rgba(239, 68, 68, 0.75)'],
      borderRadius: 8,
      maxBarThickness: 90,
    }],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b' } },
      x: { grid: { display: false }, ticks: { color: theme === 'dark' ? '#94a3b8' : '#64748b' } },
    },
  };

  return (
    <>
      <div className="row g-3 mb-4">
        <MetricCard label="Total Students" value={students.length} />
        <MetricCard label="At Risk" value={summary.atRisk} valueClass="text-danger" />
        <MetricCard label="Excellent" value={summary.excellent} valueClass="text-success" />
        <MetricCard label="Avg Performance" value={`${summary.average}%`} />
      </div>

      <section className="card app-card p-3 p-md-4 mb-4">
        <h2 className="section-title mb-3">Performance Overview</h2>
        <div className="chart-container"><Bar data={chartData} options={chartOptions} /></div>
      </section>

      <section className="card app-card p-3 p-md-4 mb-4">
        <h2 className="section-title">Student Performance Overview</h2>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead><tr><th>Name</th><th>Roll No</th><th>Performance</th><th>Attendance</th><th>Status</th><th>Last Updated</th></tr></thead>
            <tbody>
              {students.length === 0 && <EmptyTableRow columns={6} />}
              {students.map((student) => (
                <tr
                  key={student.id || student.rollNo}
                  className={`row-${student.status}`}
                  onClick={() => setSelectedStudent(student)}
                  onKeyDown={(event) => event.key === 'Enter' && setSelectedStudent(student)}
                  tabIndex={0}
                  role="button"
                >
                  <td className="fw-medium">{student.name}</td>
                  <td>{student.rollNo}</td>
                  <td><PerformanceCell student={student} /></td>
                  <td><div className="fw-medium small">{student.attendanceRate}%</div><ProgressBar value={student.attendanceRate} color="bg-info" /></td>
                  <td><StatusBadge status={student.status} /></td>
                  <td className="text-muted small">{student.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStudent && (
        <section className="card app-card p-3 p-md-4 bg-info-subtle">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-5 fw-semibold mb-0">Selected Student: {selectedStudent.name}</h3>
            <button className="btn-close" aria-label="Close details" onClick={() => setSelectedStudent(null)} />
          </div>
          <div className="row g-3">
            <div className="col-md-6"><p className="text-muted small mb-0">Roll Number</p><p className="fw-medium fs-5">{selectedStudent.rollNo}</p></div>
            <div className="col-md-6"><p className="text-muted small mb-0">Current Status</p><StatusBadge status={selectedStudent.status} /></div>
            <div className="col-md-6"><p className="text-muted small mb-1">Performance Score: {selectedStudent.performanceScore}%</p><ProgressBar value={selectedStudent.performanceScore} /></div>
            <div className="col-md-6"><p className="text-muted small mb-1">Attendance Rate: {selectedStudent.attendanceRate}%</p><ProgressBar value={selectedStudent.attendanceRate} color="bg-info" /></div>
          </div>
        </section>
      )}
    </>
  );
}
