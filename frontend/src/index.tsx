import ReactDOM from "react-dom/client";

import App from "./App";

import ErrorBoundary from "./components/Common/ErrorBoundary";

import "./styles/main.scss";

import "./utils/i18n";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
