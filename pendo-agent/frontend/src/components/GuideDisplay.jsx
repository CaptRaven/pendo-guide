function JsonBlock({ title, data }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default function GuideDisplay({ result }) {
  if (!result) return null;

  return (
    <div className="grid">
      <JsonBlock title="Original Prompt" data={result.original_prompt} />
      <JsonBlock title="Optimized Prompt" data={result.optimized_prompt} />
      <JsonBlock title="Injected Pendo Context" data={result.pendo_context} />
      <div className="panel">
        <h3>Generated Guide</h3>
        <p><strong>Title:</strong> {result.guide_output?.title}</p>
        <p><strong>Message:</strong> {result.guide_output?.message}</p>
        <ol>
          {(result.guide_output?.steps || []).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <p><strong>Critic Score:</strong> {result.critic_score}/10</p>
        <p><strong>Critic Feedback:</strong> {result.critic_feedback}</p>
        <p><strong>Regenerated:</strong> {result.regenerated ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
