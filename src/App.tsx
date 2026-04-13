import { BotBashCanvas } from './components/Canvas'

function App() {
  return (
    <main className="min-h-screen flex bg-slate-950 text-slate-100">
      <div className="w-[150px] md:w-[150px] lg:w-[20%] flex-none relative">
        <div className="sticky top-0">
          <div className="text-sm text-slate-300 p-2 app-description">
            <p>The big bot bash is a thing that <a href="https://www.youtube.com/c/BillMakingStuff" target="_blank" rel="noopener noreferrer">BillMakingStuff</a> has organized for the past few years.  This year, I want to do a thing, but because I'm a programmer who is struggling to be excited about programming I thought I'd try to make something that is (1) completely unnecessary and (2) does a thing related to something that I am already interested in.</p>
            <p>To the right is the robot generator that Bill originally posted on <a href="https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.instagram.com/billmakingstuff/&ved=2ahUKEwi2lbSIzeuTAxVhm4kEHUG-FYwQFnoECA4QAQ&usg=AOvVaw0LMy_jb5dLJKJCzcFR2xF_">his instagram</a>, and I'm going to add a few features to it.  </p>
            <p>First off, i'm going to make it clickable by identifying the different selectable options on each bot "part" (I've actually already done most of it, but I'm currently not in a place where I can properly apply them)</p>
            <p>Second, I want to add a randomizer that will "auto select" random parts.</p>
            <p>Can I just mention that the auto-complete that cursor tries to supply when you're typing is the absolute worst?  It keeps getting in my way.</p>
          </div>
        </div>
      </div>
      <div className="grow">
        <BotBashCanvas />
      </div>
    </main>
  )
}

export default App
