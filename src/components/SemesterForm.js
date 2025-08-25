// src/components/SemesterForm.js
import React, { useState, useEffect } from 'react';

const SemesterForm = ({ onGpaCalculated, onGpaUpdated, scale, editingSemester, editingIndex }) => {
  const [courses, setCourses] = useState([{ title: '', unit: '', grade: '' }]);
  const [semesterName, setSemesterName] = useState('');

  const gradePoints5 = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
  const gradePoints4Simple = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const gradePointsLUC = {
    'A+': 4.0, 'A': 3.80, 'A-': 3.67,
    'B+': 3.33, 'B': 3.00, 'B-': 2.67,
    'C+': 2.33, 'C': 2.00, 'D': 1.88, 'F': 0.00
  };

  const getGradeMap = () => {
    if (scale === '5') return gradePoints5;
    if (scale === 'luc') return gradePointsLUC;
    return gradePoints4Simple;
  };

  // ✅ Load editing semester data
  useEffect(() => {
    if (editingSemester) {
      setSemesterName(editingSemester.name);
      setCourses(editingSemester.courses);
    }
  }, [editingSemester]);

  const handleChange = (index, field, value) => {
    const newCourses = [...courses];
    newCourses[index][field] = value;
    setCourses(newCourses);
  };

  const addCourse = () => {
    setCourses([...courses, { title: '', unit: '', grade: '' }]);
  };

  const calculateGPA = () => {
    let totalUnits = 0;
    let totalPoints = 0;
    const gradeMap = getGradeMap();

    const validCourses = courses.filter(course => {
      const unit = parseFloat(course.unit);
      const grade = course.grade.toUpperCase();
      return !isNaN(unit) && gradeMap[grade] !== undefined;
    });

    validCourses.forEach(course => {
      const unit = parseFloat(course.unit);
      const grade = course.grade.toUpperCase();
      totalUnits += unit;
      totalPoints += unit * gradeMap[grade];
    });

    if (totalUnits === 0) return;

    const gpa = totalPoints / totalUnits;
    const cleanCourses = validCourses.map(c => ({
      title: c.title.trim(),
      unit: c.unit,
      grade: c.grade.toUpperCase()
    }));

    if (editingIndex !== null) {
      onGpaUpdated(editingIndex, semesterName || `Semester ${editingIndex + 1}`, Number(gpa.toFixed(2)), totalUnits, cleanCourses);
    } else {
      onGpaCalculated(semesterName || `Semester ${Math.random()}`, Number(gpa.toFixed(2)), totalUnits, cleanCourses);
    }

    setCourses([{ title: '', unit: '', grade: '' }]);
    setSemesterName('');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2>{editingIndex !== null ? "Edit Semester" : "Enter Semester Courses"}</h2>
      <input
        type="text"
        placeholder="Semester Name (e.g. 100L First Semester)"
        value={semesterName}
        onChange={e => setSemesterName(e.target.value)}
        style={{ marginBottom: '10px', width: '100%' }}
      />
      {courses.map((course, index) => (
        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Course Title"
            value={course.title}
            onChange={e => handleChange(index, 'title', e.target.value)}
          />
          <input
            type="number"
            placeholder="Unit"
            value={course.unit}
            onChange={e => handleChange(index, 'unit', e.target.value)}
          />
          <select
            value={course.grade}
            onChange={e => handleChange(index, 'grade', e.target.value)}
          >
            <option value="">Grade</option>
            {scale === '5' && ['A', 'B', 'C', 'D', 'E', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
            {scale === '4' && ['A', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
            {scale === 'luc' && Object.keys(gradePointsLUC).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      ))}
      <button onClick={addCourse}>Add Another Course</button>
      <button onClick={calculateGPA} style={{ marginLeft: '10px' }}>
        {editingIndex !== null ? "Update GPA" : "Calculate GPA"}
      </button>
    </div>
  );
};

export default SemesterForm;
