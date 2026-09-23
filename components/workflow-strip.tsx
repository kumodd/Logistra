import config from "@/config.json";
import { ArrowRight } from "./icons";

export default function WorkflowStrip() {
  return (
    <div className="workflow-strip">
      {config.home.process.map((step, index) => (
        <div className="workflow-step" key={step}>
          <span className="workflow-index">0{index + 1}</span>
          <span className="workflow-name">{step}</span>
          {index < config.home.process.length - 1 && <ArrowRight size={15} />}
        </div>
      ))}
    </div>
  );
}
