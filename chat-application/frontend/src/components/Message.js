export default function Message({ text, self }) {
  return (
    <div className={`message ${self ? "self" : ""}`}>
      {text}
    </div>
  );
}