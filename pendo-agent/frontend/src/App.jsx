import { useEffect, useState } from "react";
import PromptInput from "./components/PromptInput";
import GuideDisplay from "./components/GuideDisplay";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const SAMPLE_WALKTHROUGH = {
  original_prompt: "how do i export reports",
  optimized_prompt:
    "Task: Build a tooltip walkthrough journey for exporting reports in Analytics Dashboard.",
  pendo_context: {
    user_role: "Admin",
    current_page: "Analytics Dashboard",
    feature_clicked: "Export Reports",
    experience_level: "Intermediate",
  },
  guide_output: {
    guide_type: "walkthrough",
    title: "Export Report",
    message: "Use this quick tour to export your analytics report.",
    steps: [
      {
        selector: "#nav-analytics",
        tooltip_title: "Open Analytics",
        tooltip_body: "Click Analytics to access your report dashboard.",
        position: "right",
        action: "click",
      },
      {
        selector: "#report-filters-button",
        tooltip_title: "Set Filters",
        tooltip_body: "Choose date range and segments before exporting.",
        position: "bottom",
        action: "click",
      },
      {
        selector: "#export-reports-btn",
        tooltip_title: "Start Export",
        tooltip_body: "Click Export Reports to choose a file format.",
        position: "left",
        action: "click",
      },
      {
        selector: "#export-format-select",
        tooltip_title: "Choose Format",
        tooltip_body: "Select CSV for analysis or PDF for sharing.",
        position: "bottom",
        action: "select",
      },
      {
        selector: "#confirm-export-btn",
        tooltip_title: "Download File",
        tooltip_body: "Confirm export to generate and download your report.",
        position: "top",
        action: "click",
      },
    ],
  },
  critic_score: 9,
  critic_feedback: "clarity=4/4, relevance=3/3, completeness=2/3",
  regenerated: false,
};

const DEMO_SELECTORS = [
  "#nav-analytics",
  "#report-filters-button",
  "#export-reports-btn",
  "#export-format-select",
  "#confirm-export-btn",
];

function normalizeDemoSteps(steps) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return SAMPLE_WALKTHROUGH.guide_output.steps;
  }

  return steps.slice(0, 5).map((step, index) => {
    const fallbackSelector = DEMO_SELECTORS[index % DEMO_SELECTORS.length];
    const selector =
      typeof step.selector === "string" && step.selector.trim().startsWith("#")
        ? step.selector.trim()
        : fallbackSelector;

    return {
      selector,
      tooltip_title: step.tooltip_title || `Step ${index + 1}`,
      tooltip_body: step.tooltip_body || "Follow this action.",
      position: step.position || "bottom",
      action: step.action || "click",
    };
  });
}

function getTooltipStyle(target, position) {
  if (!target) {
    return { top: "20px", left: "20px" };
  }

  const rect = target.getBoundingClientRect();
  const gap = 12;
  const width = 280;
  const height = 160;

  let top = rect.bottom + gap;
  let left = rect.left;

  if (position === "top") {
    top = rect.top - height - gap;
    left = rect.left;
  } else if (position === "left") {
    top = rect.top;
    left = rect.left - width - gap;
  } else if (position === "right") {
    top = rect.top;
    left = rect.right + gap;
  }

  top = Math.max(12, Math.min(top, window.innerHeight - height - 12));
  left = Math.max(12, Math.min(left, window.innerWidth - width - 12));

  return { top: `${top}px`, left: `${left}px` };
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [walkthroughSteps, setWalkthroughSteps] = useState([]);
  const [walkthroughIndex, setWalkthroughIndex] = useState(0);
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({ top: "20px", left: "20px" });

  const activeStep = walkthroughActive ? walkthroughSteps[walkthroughIndex] : null;

  useEffect(() => {
    if (!activeStep) {
      return;
    }

    const target = document.querySelector(activeStep.selector);
    setTooltipStyle(getTooltipStyle(target, activeStep.position));

    if (target) {
      target.classList.add("walkthrough-target-active");
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }

    return () => {
      if (target) {
        target.classList.remove("walkthrough-target-active");
      }
    };
  }, [activeStep]);

  const onGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/generate-guide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setWalkthroughActive(false);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onLoadSample = () => {
    setError("");
    setResult(SAMPLE_WALKTHROUGH);
    setWalkthroughActive(false);
  };

  const startWalkthrough = () => {
    const steps = normalizeDemoSteps(result?.guide_output?.steps || []);
    setWalkthroughSteps(steps);
    setWalkthroughIndex(0);
    setWalkthroughActive(true);
  };

  const nextStep = () => {
    if (walkthroughIndex >= walkthroughSteps.length - 1) {
      setWalkthroughActive(false);
      return;
    }
    setWalkthroughIndex((prev) => prev + 1);
  };

  const previousStep = () => {
    setWalkthroughIndex((prev) => Math.max(0, prev - 1));
  };

  const stopWalkthrough = () => {
    setWalkthroughActive(false);
  };

  const handleTargetInteraction = (selector, eventType = "click") => {
    if (!walkthroughActive || !activeStep) {
      return;
    }
    if (activeStep.selector === selector && activeStep.action === eventType) {
      nextStep();
    }
  };

  return (
    <main className="container">
      <h1>Pendo Prompt Optimization Agent</h1>
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={onGenerate}
        onLoadSample={onLoadSample}
        loading={loading}
      />
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="demo-header">
          <h2>Demo Pendo Dashboard</h2>
          <button onClick={startWalkthrough} disabled={!result}>
            Start Walkthrough
          </button>
        </div>
        <p className="demo-subtitle">
          Simulated analytics workspace. Start walkthrough to see tooltip journey in action.
        </p>

        <div className="demo-shell">
          <aside className="demo-sidebar">
            <div className="demo-logo">Pendo</div>
            <button id="nav-home" className="demo-nav-btn">Home</button>
            <button
              id="nav-analytics"
              className="demo-nav-btn"
              onClick={() => handleTargetInteraction("#nav-analytics")}
            >
              Analytics
            </button>
            <button id="nav-guides" className="demo-nav-btn">Guides</button>
          </aside>

          <section className="demo-main">
            <div className="demo-toolbar">
              <button
                id="report-filters-button"
                onClick={() => handleTargetInteraction("#report-filters-button")}
              >
                Filters
              </button>
              <button
                id="export-reports-btn"
                onClick={() => handleTargetInteraction("#export-reports-btn")}
              >
                Export Reports
              </button>
              <select
                id="export-format-select"
                defaultValue="CSV"
                onChange={() => handleTargetInteraction("#export-format-select", "select")}
              >
                <option>CSV</option>
                <option>PDF</option>
              </select>
              <button
                id="confirm-export-btn"
                onClick={() => handleTargetInteraction("#confirm-export-btn")}
              >
                Confirm Export
              </button>
            </div>

            <div className="demo-cards">
              <div className="demo-card">Active Users: 4,218</div>
              <div className="demo-card">Feature Adoption: 68%</div>
              <div className="demo-card">Guide Completion: 74%</div>
            </div>
          </section>
        </div>
      </div>

      {walkthroughActive && activeStep && (
        <div className="walkthrough-tooltip" style={tooltipStyle}>
          <p className="walkthrough-step-index">
            Step {walkthroughIndex + 1} of {walkthroughSteps.length}
          </p>
          <h3>{activeStep.tooltip_title}</h3>
          <p>{activeStep.tooltip_body}</p>
          <p className="walkthrough-target-text">Target: {activeStep.selector}</p>
          <div className="walkthrough-actions">
            <button onClick={previousStep} disabled={walkthroughIndex === 0}>
              Back
            </button>
            <button onClick={nextStep}>Next</button>
            <button onClick={stopWalkthrough}>End</button>
          </div>
        </div>
      )}

      <GuideDisplay result={result} />
    </main>
  );
}
