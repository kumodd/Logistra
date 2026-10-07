"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

type Scenario = "before" | "with";

type DistanceMapProps = {
  scenario: Scenario;
  inventoryLabels: string[];
  demandLabels: string[];
};

const beforeInventory = [
  { x: 118, y: 75, label: "Rajasthan" },
  { x: 137, y: 126, label: "Gujarat" },
  { x: 178, y: 154, label: "Maharashtra" },
  { x: 211, y: 205, label: "Karnataka" },
  { x: 215, y: 254, label: "Kerala" },
  { x: 263, y: 239, label: "Tamil Nadu" },
];

const demand = [
  { x: 291, y: 89, label: "Lucknow" },
  { x: 322, y: 111, label: "Bihar" },
  { x: 319, y: 137, label: "Jharkhand" },
  { x: 355, y: 130, label: "Kolkata" },
];

const beforeRoutes = [
  "M118 75 Q206 65 291 89",
  "M137 126 Q220 105 322 111",
  "M178 154 Q246 143 319 137",
  "M211 205 Q270 180 355 130",
  "M215 254 Q287 213 322 111",
  "M263 239 Q310 188 355 130",
];

const withRoutes = [
  "M290 128 Q292 108 291 89",
  "M290 128 Q305 117 322 111",
  "M290 128 Q305 132 319 137",
  "M290 128 Q327 132 355 130",
];

const indiaOutline = "M157 24 L194 34 L223 51 L252 56 L270 78 L299 87 L315 106 L350 113 L369 132 L348 151 L337 170 L325 184 L318 211 L299 226 L286 251 L267 271 L247 254 L232 232 L213 220 L194 198 L180 181 L160 166 L143 148 L125 137 L113 115 L98 96 L108 77 L124 66 L129 46 Z";

export default function DistanceMap({ scenario, inventoryLabels, demandLabels }: DistanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const inventory = scenario === "before" ? beforeInventory : [{ x: 290, y: 128, label: "Logistra" }];
  const routes = scenario === "before" ? beforeRoutes : withRoutes;

  useEffect(() => {
    const element = mapRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`distance-map distance-map-${scenario} ${isVisible ? "is-visible" : ""}`} ref={mapRef}>
      <div className="map-meta"><span>SIMPLIFIED REGIONAL VIEW</span><span>{scenario === "before" ? "MULTI-REGION" : "CLOSER TO DEMAND"}</span></div>
      <svg viewBox="0 0 460 285" role="img" aria-label={scenario === "before" ? "Illustrative long-distance shipping routes from multiple Indian inventory locations to Eastern India demand" : "Illustrative shorter shipping routes from Logistra inventory near Eastern India demand"}>
        <defs>
          <marker id={`map-arrow-${scenario}`} markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill={scenario === "before" ? "#ed4b28" : "#f8a28d"} /></marker>
        </defs>
        <path className="india-outline" d={indiaOutline} />
        {scenario === "with" && <path className="eastern-focus" d="M272 76 L299 87 L315 106 L350 113 L369 132 L348 151 L337 170 L318 174 L305 153 L290 142 L278 116 Z" />}
        {routes.map((route, index) => <path className="map-route" d={route} key={route} pathLength={1} style={{ "--route-delay": `${index * 110}ms` } as CSSProperties} markerEnd={`url(#map-arrow-${scenario})`} />)}
        {inventory.map((point) => <g className={`map-point inventory-point ${scenario === "with" ? "logistra-point" : ""}`} key={point.label}><circle cx={point.x} cy={point.y} r={scenario === "with" ? 8 : 4} /><text x={point.x + 8} y={point.y - 7}>{point.label}</text></g>)}
        {demand.map((point) => <g className="map-point demand-point" key={point.label}><circle cx={point.x} cy={point.y} r="4" /><text x={point.x + 8} y={point.y + 4}>{point.label}</text></g>)}
        {scenario === "with" && <g className="demand-cluster"><circle cx="322" cy="111" r="22" /><text x="333" y="96">EASTERN INDIA</text><text x="333" y="108">DEMAND</text></g>}
      </svg>
      <div className="map-legend">
        <div><span className="map-legend-label"><i className="legend-dot inventory-legend" />Inventory</span><p>{inventoryLabels.join(" · ")}</p></div>
        <div><span className="map-legend-label"><i className="legend-dot demand-legend" />Customer locations</span><p>{demandLabels.join(" · ")}</p></div>
      </div>
    </div>
  );
}
