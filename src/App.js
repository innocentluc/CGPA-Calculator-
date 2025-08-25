import React, { useState, useEffect } from 'react';
import SemesterForm from './components/SemesterForm';
import ConfirmModal from './components/ConfirmModal';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';

function App() {
  const [semesters, setSemesters] = useState(() => {
    const saved = localStorage.getItem('cgpa_semesters');
    return saved ? JSON.parse(saved) : [];
  });
  const [scale, setScale] = useState('5');
  const [theme, setTheme] = useState('light');
  const [editingIndex, setEditingIndex] = useState(null);
  // New states for user and institution name
  const [userName, setUserName] = useState('');
  const [institutionName, setInstitutionName] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // "single" or "all"
  const [semesterToDelete, setSemesterToDelete] = useState(null);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('cgpa_semesters', JSON.stringify(semesters));
  }, [semesters]);

  const addSemester = (name, gpa, totalUnits, courses = []) => {
    setSemesters(prev => [...prev, { name, gpa, totalUnits, courses }]);
  };

  const updateSemester = (index, name, gpa, totalUnits, courses) => {
    const updated = [...semesters];
    updated[index] = { name, gpa, totalUnits, courses };
    setSemesters(updated);
    setEditingIndex(null);
  };

  const openDeleteModal = (type, index = null) => {
    setDeleteType(type);
    setSemesterToDelete(index);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteType === "single" && semesterToDelete !== null) {
      setSemesters(prev => prev.filter((_, i) => i !== semesterToDelete));
    }
    if (deleteType === "all") {
      setSemesters([]);
      localStorage.removeItem('cgpa_semesters');
    }
    setIsModalOpen(false);
  };

  const calculateCGPA = () => {
    const totalQualityPoints = semesters.reduce(
      (acc, sem) => acc + (sem.gpa * sem.totalUnits),
      0
    );
    const totalUnits = semesters.reduce((acc, sem) => acc + sem.totalUnits, 0);
    return totalUnits > 0 ? (totalQualityPoints / totalUnits).toFixed(2) : '0.00';
  };

  const getClassification = (cgpa) => {
    const gpa = parseFloat(cgpa);

    if (scale === '5') {
      if (gpa >= 4.5) return "First Class";
      if (gpa >= 3.5) return "Second Class Upper";
      if (gpa >= 2.4) return "Second Class Lower";
      if (gpa >= 1.5) return "Third Class";
      return "Pass / Fail";
    }
    if (scale === '4') {
      if (gpa >= 3.7) return "First Class";
      if (gpa >= 3.0) return "Second Class Upper";
      if (gpa >= 2.0) return "Second Class Lower";
      if (gpa >= 1.0) return "Third Class";
      return "Pass / Fail";
    }
    if (scale === 'luc') {
      if (gpa > 3.80) return "Exceptionally High Distinction";
      if (gpa >= 3.67) return "Distinction";
      if (gpa >= 3.0) return "Merit";
      if (gpa >= 2.0) return "Pass";
      if (gpa >= 1.88) return "Remedial";
      return "Fail";
    }
    return "-";
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("CGPA Report", 14, 15);
    // Add user and institution name
    doc.setFontSize(12);
    doc.text(`Name: ${userName || '-'}\nInstitution: ${institutionName || '-'}`, 14, 23);
    let yOffset = 35;

    semesters.forEach((sem, idx) => {
      doc.setFontSize(14);
      doc.text(`${sem.name || `Semester ${idx + 1}`}`, 14, yOffset);

      const tableData = sem.courses.map(course => [
        course.title, course.unit, course.grade
      ]);

      doc.autoTable({
        head: [['Course Title', 'Unit', 'Grade']],
        body: tableData,
        startY: yOffset + 5,
        theme: 'grid',
        styles: { halign: 'center' },
        headStyles: { fillColor: [22, 160, 133] }
      });

      yOffset = doc.lastAutoTable.finalY + 10;
      doc.text(`GPA: ${sem.gpa}`, 14, yOffset);
      yOffset += 10;
    });

    const finalCGPA = calculateCGPA();
    const classification = getClassification(finalCGPA);

    doc.setFontSize(14);
    doc.text(`Final CGPA: ${finalCGPA}`, 14, yOffset + 5);
    doc.text(`Classification: ${classification}`, 14, yOffset + 15);
    doc.save('CGPA_Report.pdf');
  };

  const cgpa = calculateCGPA();
  const classification = getClassification(cgpa);

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <h1>🎓GRADELY</h1>

        {/* User and Institution Name Inputs */}
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <label><strong>Your Name:</strong></label><br />
            <input
              type="text"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder="Enter your name"
              style={{ width: '200px' }}
            />
          </div>
          <div>
            <label><strong>Institution Name:</strong></label><br />
            <input
              type="text"
              value={institutionName}
              onChange={e => setInstitutionName(e.target.value)}
              placeholder="Enter institution name"
              style={{ width: '250px' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label><strong>Choose Grading Scale:</strong> </label>
          <select value={scale} onChange={(e) => setScale(e.target.value)}>
            <option value="5">5.0 Scale (Nigerian Universities)</option>
            <option value="4">4.0 Scale (General)</option>
            <option value="luc">4.0 Scale (Lincoln University Malaysia)</option>
          </select>
        </div>

        <SemesterForm
          onGpaCalculated={addSemester}
          onGpaUpdated={updateSemester}
          scale={scale}
          editingSemester={editingIndex !== null ? semesters[editingIndex] : null}
          editingIndex={editingIndex}
        />

        <h2>All Semesters:</h2>
        {semesters.length === 0 ? (
          <p>No semesters added yet.</p>
        ) : (
          <ol>
            {semesters.map((sem, index) => (
              <li key={index}>
                <strong>{sem.name || `Semester ${index + 1}`}</strong> – GPA: <strong>{sem.gpa}</strong> | Units: {sem.totalUnits}
                <button style={{ marginLeft: '10px' }} onClick={() => setEditingIndex(index)}>✏️ Edit</button>
                <button style={{ marginLeft: '5px', color: 'red' }} onClick={() => openDeleteModal("single", index)}>🗑 Delete</button>
              </li>
            ))}
          </ol>
        )}

        {semesters.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h2>CGPA: {cgpa}</h2>
            <h3>Classification: {classification}</h3>
            <button onClick={() => openDeleteModal("all")} className="delete" style={{ marginRight: '10px' }}>
              Reset / Delete All Semesters
            </button>
            <button onClick={exportPDF}>Export Report as PDF</button>
          </div>
        )}
      </div>

      {/* ✅ Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Confirm Delete"
        message={deleteType === "all" ? "Are you sure you want to delete all semesters?" : "Are you sure you want to delete this semester?"}
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

export default App;
