export default function PromptInput({ prompt, setPrompt, onGenerate, onLoadSample, loading }) {
  return (
    <div className="panel">
      <h2>User Prompt</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., how do i export reports"
        rows={4}
      />
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={onGenerate} disabled={loading || !prompt.trim()}>
          {loading ? "Generating..." : "Generate Guide"}
        </button>
        <button type="button" onClick={onLoadSample} disabled={loading}>
          Load Sample Walkthrough
        </button>
      </div>
    </div>
  );
}
