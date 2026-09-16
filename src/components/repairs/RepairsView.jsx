// Repairs & Diagnostics View
// Customer PCs with hardware faults: dead PSUs, dried thermal paste, faulty RAM, dying GPUs, and failing storage
import React from 'react';
import { useGameStore } from '../../store/gameStore';

export function RepairsView() {
  const repairJobs = useGameStore((s) => s.repairJobs);
  const activeRepair = useGameStore((s) => s.activeRepair);
  const acceptRepairJob = useGameStore((s) => s.acceptRepairJob);
  const diagnoseRepair = useGameStore((s) => s.diagnoseRepair);
  const completeRepairJob = useGameStore((s) => s.completeRepairJob);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <div className="repairs-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🔧 PC REPAIR & DIAGNOSTIC CLINIC</h2>
          <p className="page-subtitle">
            Troubleshoot and fix customer systems suffering from hardware faults, thermal throttling, POST beeps, and component failures.
          </p>
        </div>
      </div>

      {/* Active Repair Workbench Banner */}
      {activeRepair && (
        <div className="active-repair-box">
          <div className="box-header">
            <span className="badge-warning">SYSTEM CURRENTLY ON WORKBENCH</span>
            <span className="labor-fee">Labor Bounty: <strong>₹{activeRepair.laborFee.toLocaleString('en-IN')}</strong></span>
          </div>

          <div className="box-body">
            <h3>{activeRepair.title}</h3>
            <p className="complaint">
              <strong>Customer Complaint ({activeRepair.customerName}):</strong> "{activeRepair.complaint}"
            </p>
            <p className="symptom">
              <strong>Observed Symptom:</strong> {activeRepair.symptom}
            </p>

            {/* Diagnostic Step */}
            <div className="diagnostic-step">
              <div className="step-left">
                <strong>Diagnostic Tester:</strong>
                <span>{activeRepair.diagnosticPrompt}</span>
              </div>
              <button
                onClick={diagnoseRepair}
                className="btn-secondary"
                disabled={activeRepair.diagnosed}
              >
                {activeRepair.diagnosed ? '✅ Diagnostic Complete' : '🔍 Run Diagnostic Hardware Tool'}
              </button>
            </div>

            {activeRepair.diagnosed && (
              <div className="diagnostic-result">
                <strong>📋 Diagnostic Telemetry:</strong>
                <p>{activeRepair.diagnosticClue}</p>
                <div className="solution-tip">
                  💡 <strong>Action Required:</strong> {activeRepair.recommendedAction}
                </div>
              </div>
            )}

            <div className="repair-actions">
              <button
                onClick={() => setActiveTab('workstation')}
                className="btn-primary"
              >
                🛠️ Go to Workstation to Replace {activeRepair.faultyPartCategory.toUpperCase()}
              </button>
              <button
                onClick={completeRepairJob}
                className="btn-success"
              >
                ✅ Verify & Deliver Repaired PC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Repair Inquiries */}
      <h3 className="section-title">INCOMING REPAIR REQUESTS</h3>
      <div className="repairs-grid">
        {repairJobs.map((job) => (
          <div key={job.id} className="repair-job-card">
            <div className="job-card-top">
              <span className="customer-tag">👤 {job.customerName}</span>
              <span className="bounty-tag">Labor: ₹{job.laborFee.toLocaleString('en-IN')}</span>
            </div>

            <h4 className="job-title">{job.title}</h4>
            <p className="job-complaint">"{job.complaint}"</p>

            <div className="job-symptom-box">
              <span>Symptom:</span>
              <p>{job.symptom}</p>
            </div>

            <button
              onClick={() => acceptRepairJob(job.id)}
              disabled={!!activeRepair}
              className="btn-primary btn-accept"
            >
              {activeRepair ? 'Finish Current Repair First' : 'Accept Repair Job'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
