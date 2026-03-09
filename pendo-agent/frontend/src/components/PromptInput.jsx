export default function PromptInput({ prompt, setPrompt, onGenerate, loading }) {
  return (
    <div className="panel">
      <h2>User Prompt</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., how do i export reports"
        rows={4}
      />
      <button onClick={onGenerate} disabled={loading || !prompt.trim()}>
        {loading ? "Generating..." : "Generate Guide"}
      </button>
    </div>
  );
}
