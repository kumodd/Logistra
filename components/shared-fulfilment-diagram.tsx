export default function SharedFulfilmentDiagram() {
  return (
    <div className="shared-diagram" role="img" aria-label="Illustration of brand-specific stock and orders moving through shared fulfilment infrastructure">
      <div className="shared-diagram-top"><span>REGIONAL FULFILMENT LAYER</span><span>EASTERN INDIA</span></div>
      <div className="shared-diagram-flow">
        <div className="shared-diagram-side">
          <span className="shared-diagram-label">BRANDS</span>
          <div className="shared-mini-card"><i />Brand stock / SKU set</div>
          <div className="shared-mini-card"><i />Brand stock / SKU set</div>
          <div className="shared-mini-card"><i />Brand stock / SKU set</div>
        </div>
        <div className="shared-arrow" aria-hidden="true">→</div>
        <div className="shared-diagram-core">
          <span className="shared-core-mark">L</span>
          <strong>LOGISTRA</strong>
          <small>RECEIVE · STORE · PICK · PACK · SHIP · RETURN</small>
          <div className="shared-core-lines"><span /><span /><span /></div>
        </div>
        <div className="shared-arrow" aria-hidden="true">→</div>
        <div className="shared-diagram-side shared-diagram-demand">
          <span className="shared-diagram-label">DEMAND</span>
          <div className="shared-mini-card"><i />Eastern India orders</div>
          <div className="shared-mini-card"><i />Eastern India orders</div>
          <div className="shared-mini-card"><i />Eastern India orders</div>
        </div>
      </div>
      <div className="shared-diagram-bottom"><span>IDENTIFIED INVENTORY</span><strong>SHARED OPERATIONAL INFRASTRUCTURE</strong><span>REGIONAL ORDERS</span></div>
    </div>
  );
}
