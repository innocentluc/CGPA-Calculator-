// src/components/ConfirmModal.js
import React from "react";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div style={styles.buttons}>
          <button onClick={onCancel} style={styles.cancel}>Cancel</button>
          <button onClick={onConfirm} style={styles.confirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
    justifyContent: "center", alignItems: "center", zIndex: 1000
  },
  modal: {
    background: "#fff", padding: "20px", borderRadius: "8px",
    width: "350px", textAlign: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
  },
  buttons: { marginTop: "20px", display: "flex", justifyContent: "space-between" },
  cancel: { background: "#ccc", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" },
  confirm: { background: "red", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "5px", cursor: "pointer" }
};

export default ConfirmModal;
