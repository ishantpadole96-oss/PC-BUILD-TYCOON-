// Customer Order System
// Varied customer archetypes, budgets in INR, requirement checks, and order acceptance
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundFx } from '../../utils/audio';

export function OrdersView() {
  const orders = useGameStore((s) => s.orders);
  const activeOrder = useGameStore((s) => s.activeOrder);
  const acceptOrder = useGameStore((s) => s.acceptOrder);
  const abandonOrder = useGameStore((s) => s.abandonOrder);
  const refreshOrders = useGameStore((s) => s.refreshOrders);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <div className="orders-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">📋 CUSTOMER CLIENT ORDERS</h2>
          <p className="page-subtitle">
            Review client requests, examine their budget and performance targets, and accept contracts for your custom PC business.
          </p>
        </div>
        <button
          onClick={() => { soundFx.playClick(); refreshOrders(); }}
          className="btn-secondary"
          title="Search for new customer inquiries"
        >
          🔄 Refresh Inquiries
        </button>
      </div>

      {/* Currently In-Progress Order */}
      {activeOrder && (
        <div className="active-order-highlight">
          <div className="highlight-header">
            <span className="badge-active">ACTIVE CONTRACT IN PROGRESS</span>
            <button onClick={() => { soundFx.playClick(); abandonOrder(); }} className="btn-danger-sm">Abandon Contract</button>
          </div>
          <div className="highlight-body">
            <div className="client-profile">
              <span className="client-avatar-lg">{activeOrder.customer.avatar}</span>
              <div>
                <h3 className="client-name">{activeOrder.customer.name}</h3>
                <span className="client-type">{activeOrder.customer.type}</span>
              </div>
            </div>
            <div className="client-speech">
              "{activeOrder.dialogue}"
            </div>
            <div className="requirements-grid">
              <div className="req-card">
                <span className="req-label">BUDGET</span>
                <span className="req-val text-cash">₹{activeOrder.requirements.budget.toLocaleString('en-IN')}</span>
              </div>
              <div className="req-card">
                <span className="req-label">USE CASE</span>
                <span className="req-val">{activeOrder.requirements.useCase.toUpperCase()}</span>
              </div>
              <div className="req-card">
                <span className="req-label">RESOLUTION</span>
                <span className="req-val">{activeOrder.requirements.resolution}</span>
              </div>
              <div className="req-card">
                <span className="req-label">TARGET FPS</span>
                <span className="req-val">{activeOrder.requirements.fpsTarget > 0 ? `${activeOrder.requirements.fpsTarget}+ FPS` : 'N/A'}</span>
              </div>
              <div className="req-card">
                <span className="req-label">EST. REWARD</span>
                <span className="req-val text-success">+₹{activeOrder.reward.base.toLocaleString('en-IN')} Profit</span>
              </div>
            </div>
            <div className="highlight-actions">
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('workstation'); }}
                className="btn-primary btn-lg"
              >
                🛠️ Open Assembly Workstation
              </button>
              <button
                onClick={() => { soundFx.playClick(); setActiveTab('marketplace'); }}
                className="btn-secondary"
              >
                🛒 Buy Parts in Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Orders List */}
      <h3 className="section-title">AVAILABLE CONTRACT REQUESTS</h3>
      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="empty-orders-msg">
            <p>No client requests waiting. Click "Refresh Inquiries" or advance to the next day!</p>
          </div>
        ) : (
          orders.map((order) => {
            const isCurrent = activeOrder?.id === order.id;
            return (
              <div key={order.id} className={`order-card ${isCurrent ? 'order-card-current' : ''}`}>
                <div className="order-card-top">
                  <div className="client-info">
                    <span className="avatar">{order.customer.avatar}</span>
                    <div>
                      <h4 className="name">{order.customer.name}</h4>
                      <span className="type">{order.customer.type}</span>
                    </div>
                  </div>
                  <span className={`diff-badge diff-${order.difficulty}`}>
                    {order.difficulty.toUpperCase()}
                  </span>
                </div>

                <div className="dialogue-box">
                  "{order.dialogue}"
                </div>

                <div className="specs-list">
                  <div className="spec-row">
                    <span>Budget Limit:</span>
                    <strong>₹{order.requirements.budget.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Target Resolution:</span>
                    <strong>{order.requirements.resolution}</strong>
                  </div>
                  {order.requirements.fpsTarget > 0 && (
                    <div className="spec-row">
                      <span>FPS Target:</span>
                      <strong>{order.requirements.fpsTarget} FPS</strong>
                    </div>
                  )}
                  <div className="spec-row">
                    <span>Noise Preference:</span>
                    <strong>{order.requirements.noisePref}</strong>
                  </div>
                  <div className="spec-row">
                    <span>Est. Labor Profit:</span>
                    <strong className="text-success">+₹{order.reward.base.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <button
                onClick={() => { soundFx.playClick(); acceptOrder(order.id); }}
                disabled={!!activeOrder}
                  className="btn-primary btn-accept"
                >
                  {isCurrent ? 'Contract In Progress' : activeOrder ? 'Finish Active Contract First' : 'Accept Contract'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
