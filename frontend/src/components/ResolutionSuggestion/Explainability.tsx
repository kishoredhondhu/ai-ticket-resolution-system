import React from "react";

interface Props {
  rationale: string;
}

const Explainability: React.FC<Props> = ({ rationale }) => (
  <div className="explainability">
    <strong>Why this resolution?</strong>

    <p>{rationale}</p>
  </div>
);

export default Explainability;
