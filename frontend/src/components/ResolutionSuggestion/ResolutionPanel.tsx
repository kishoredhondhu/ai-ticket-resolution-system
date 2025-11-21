import React from "react";
import Explainability from "./Explainability";
interface Props {
  suggestion: string;
  rationale: string;
  onOverride: () => void;
}
const ResolutionPanel: React.FC<Props> = ({
  suggestion,
  rationale,
  onOverride,
}) => (
  <section className="resolution-panel">
    <h3>Suggested Resolution</h3>
    <div className="resolution-text">{suggestion}</div>
    <Explainability rationale={rationale} />
    <button onClick={onOverride}>Override Suggestion</button>
  </section>
);
export default ResolutionPanel;
