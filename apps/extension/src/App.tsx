export function App() {
  return (
    <main>
      <section className="readiness" aria-labelledby="readiness-title">
        <span className="readiness-mark" aria-hidden="true" />
        <div>
          <p className="eyebrow">Build readiness</p>
          <h1 id="readiness-title">Extension build is working</h1>
          <p>The Manifest V3 popup loaded successfully.</p>
        </div>
      </section>
    </main>
  );
}
