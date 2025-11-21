import React, { useState } from "react";
interface Props {
  onSubmit: (feedback: string) => void;
}
const ResolutionFeedback: React.FC<Props> = ({ onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  return (
    <form
      className="feedback-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(feedback);
      }}
    >
      <label>
        Your Feedback:
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How accurate or useful was the suggested resolution?"
          required
        />
      </label>
      <button type="submit">Submit Feedback</button>
    </form>
  );
};
export default ResolutionFeedback;
