import { useState } from 'react'

function FramedPreview() {
  const [previewLoaded, setPreviewLoaded] = useState(false)

  return (
    <figure className="frame-composite" aria-label="Family Frame showing the live product">
      <div className="frame-window">
        <iframe
          className={`frame-preview${previewLoaded ? ' is-ready' : ''}`}
          src="/?framePreview=1"
          title="Live Family Frame preview"
          onLoad={() => setPreviewLoaded(true)}
        />
        <span className="frame-glass" aria-hidden="true" />
      </div>
      <img
        className="frame-photo"
        src="/landing/frame-window-overlay.png"
        alt="A silver family frame resting on a wooden cabinet"
        width="735"
        height="913"
        fetchPriority="high"
      />
    </figure>
  )
}

export function LandingApp() {
  return (
    <main className="landing">
      <section className="hero" aria-labelledby="landing-title">
        <div className="hero-copy">
          <p className="eyebrow">Family Frame</p>
          <h1 id="landing-title">Your family, always close.</h1>
          <p className="subcopy">A living frame for the moments that make a family.</p>
          <a className="primary-cta" href="/">
            Open the frame
          </a>
        </div>
        <div className="hero-object">
          <FramedPreview />
        </div>
      </section>
    </main>
  )
}
