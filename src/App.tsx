function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-8 px-6 py-16">
        <header className="space-y-4">
          <p className="inline-flex rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-sm text-fuchsia-200">
            React + TypeScript + Tailwind starter
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            GitHub Pages-ready template
          </h1>
          <p className="max-w-2xl text-lg text-slate-300">
            Build your client-side React app quickly with Tailwind utilities and
            ship it to GitHub Pages with the included workflow.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-2 text-xl font-semibold">Start editing</h2>
            <p className="text-slate-300">
              Update <code className="rounded bg-slate-800 px-1.5 py-0.5">src/App.tsx</code>{' '}
              and create your pages and components.
            </p>
          </article>
          <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h2 className="mb-2 text-xl font-semibold">Deploy automatically</h2>
            <p className="text-slate-300">
              Push to your default branch and GitHub Actions publishes the site to
              GitHub Pages.
            </p>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App
