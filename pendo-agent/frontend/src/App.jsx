import { useState } from "react";
import PromptInput from "./components/PromptInput";
import GuideDisplay from "./components/GuideDisplay";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1>Pendo Prompt Optimization Agent</h1>
      <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={onGenerate} loading={loading} />
      {error && <div className="error">{error}</div>}
      <GuideDisplay result={result} />
    </main>
  );
}
