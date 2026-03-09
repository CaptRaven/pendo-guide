import { useEffect, useState } from "react";
import PromptInput from "./components/PromptInput";
import GuideDisplay from "./components/GuideDisplay";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const SAMPLE_WALKTHROUGH = {
  original_prompt: "help users write better prompts",
  optimized_prompt:
    "Task: Build a tooltip walkthrough journey that teaches users to turn vague prompts into structured prompts.",
  pendo_context: {
    user_role: "Admin",
    current_page: "Prompt Studio",
    feature_clicked: "Prompt Optimizer",
    experience_level: "Beginner",
  },
  guide_output: {
    guide_type: "walkthrough",
    title: "Prompt Coaching Tour",
    message: "Learn a five-step method for stronger prompts.",
    steps: [
      {
        selector: "#prompt-input",
        tooltip_title: "Start With Draft",
        tooltip_body: "Type your raw prompt idea here, even if it is vague.",
        position: "right",
        action: "type",
      },
      {
        selector: "#task-field",
        tooltip_title: "Define The Task",
        tooltip_body: "Write one clear task using an action verb like Explain or Generate.",
        position: "bottom",
        action: "type",
      },
      {
        selector: "#context-field",
        tooltip_title: "Add Context",
        tooltip_body: "Give product details, user intent, and relevant constraints.",
        position: "bottom",
        action: "type",
      },
      {
        selector: "#output-format-field",
        tooltip_title: "Choose Format",
        tooltip_body: "Select the output format you want from the model.",
        position: "left",
        action: "select",
      },
      {
        selector: "#generate-guide-btn",
        tooltip_title: "Generate Better Prompt",
        tooltip_body: "Click Generate to create a structured, high-quality prompt.",
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
  "#prompt-input",
  "#task-field",
  "#context-field",
  "#output-format-field",
  "#generate-guide-btn",
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
  const width = 300;
  const height = 180;

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

function isWeakPrompt(input) {
  const text = (input || "").trim();
  if (!text) return false;

  const words = text.split(/\s+/);
  const hasStructureSignals = /(task:|context:|audience:|constraints:|output)/i.test(text);
  const hasQuestionDepth = /(for|because|with|using|step|format|example)/i.test(text);

  if (hasStructureSignals) return false;
  if (words.length < 6) return true;
  if (text.length < 35 && !hasQuestionDepth) return true;
  return false;
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
  const [showCoachInvite, setShowCoachInvite] = useState(false);
  const [dismissedWeakPrompt, setDismissedWeakPrompt] = useState("");

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

  useEffect(() => {
    const weak = isWeakPrompt(prompt);

    if (!weak) {
      setShowCoachInvite(false);
      setDismissedWeakPrompt("");
      return;
    }

    if (dismissedWeakPrompt === prompt.trim()) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowCoachInvite(true);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [prompt, dismissedWeakPrompt]);

  const onGenerate = async () => {
    if (isWeakPrompt(prompt) && !showCoachInvite) {
      setShowCoachInvite(true);
      return;
    }

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

  const startWalkthroughWithGuide = (guidePayload) => {
    const steps = normalizeDemoSteps(guidePayload?.guide_output?.steps || []);
    setWalkthroughSteps(steps);
    setWalkthroughIndex(0);
    setWalkthroughActive(true);
  };

  const startWalkthrough = () => {
    startWalkthroughWithGuide(result || SAMPLE_WALKTHROUGH);
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

  const acceptPromptCoaching = () => {
    const source = result || SAMPLE_WALKTHROUGH;
    if (!result) {
      setResult(source);
    }
    setShowCoachInvite(false);
    startWalkthroughWithGuide(source);
  };

  const dismissPromptCoaching = () => {
    setShowCoachInvite(false);
    setDismissedWeakPrompt(prompt.trim());
  };

  return (
    <main className="container">
      <h1>Pendo Prompt guide</h1>
      <PromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onGenerate={onGenerate}
        onLoadSample={onLoadSample}
        loading={loading}
      />

      {showCoachInvite && (
        <div className="coach-invite" role="dialog" aria-modal="false">
          <div>
            <strong>Need help prompting better?</strong>
            <p>
              I noticed this prompt may be too vague. Start a quick guide to learn a stronger
              prompt structure?
            </p>
          </div>
          <div className="coach-invite-actions">
            <button onClick={acceptPromptCoaching}>Yes, show me</button>
            <button className="coach-secondary" onClick={dismissPromptCoaching}>
              Not now
            </button>
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}

      <div className="panel">
        <div className="demo-header">
          <h2>Demo Prompt Coaching Workspace</h2>
          <button onClick={startWalkthrough}>
            Start Guide
          </button>
        </div>
        <p className="demo-subtitle">
          Simulated prompt-building screen. Follow the tour to coach users toward better prompts.
        </p>

        <div className="demo-shell">
          <aside className="demo-sidebar">
            <div className="demo-logo">Pendo</div>
            <button id="nav-home" className="demo-nav-btn">Home</button>
            <button id="nav-prompt-coach" className="demo-nav-btn">Prompt Coach</button>
            <button id="nav-guides" className="demo-nav-btn">Guides</button>
          </aside>

          <section className="demo-main">
            <div className="demo-form-grid">
              <label htmlFor="prompt-input">Raw User Prompt</label>
              <textarea
                id="prompt-input"
                rows={3}
                placeholder="e.g. write better onboarding message"
                onChange={() => handleTargetInteraction("#prompt-input", "type")}
              />

              <label htmlFor="task-field">Task</label>
              <input
                id="task-field"
                type="text"
                placeholder="Explain how to onboard first-time users"
                onChange={() => handleTargetInteraction("#task-field", "type")}
              />

              <label htmlFor="context-field">Context</label>
              <textarea
                id="context-field"
                rows={2}
                placeholder="SaaS analytics product, onboarding checklist available"
                onChange={() => handleTargetInteraction("#context-field", "type")}
              />

              <label htmlFor="output-format-field">Output Format</label>
              <select
                id="output-format-field"
                defaultValue="Step-by-step"
                onChange={() => handleTargetInteraction("#output-format-field", "select")}
              >
                <option>Step-by-step</option>
                <option>Tooltip Walkthrough</option>
                <option>Checklist</option>
              </select>
            </div>

            <div className="demo-toolbar">
              <button id="optimize-prompt-btn">Optimize Prompt</button>
              <button
                id="generate-guide-btn"
                onClick={() => handleTargetInteraction("#generate-guide-btn")}
              >
                Generate Guide
              </button>
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
