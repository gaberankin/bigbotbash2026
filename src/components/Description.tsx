import githubIconImage from "../assets/github-icon.svg";


export function Description() {
  return <>
    <p>
      The big bot bash is a thing that{" "}
      <a
        href="https://www.youtube.com/c/BillMakingStuff"
        target="_blank"
      >
        BillMakingStuff
      </a>{" "}
      has organized for the past few years. This year, I want to do a
      thing, but because I'm a modern-day programmer who is struggling
      to be excited about programming I thought I'd try to make
      something that is (1) completely unnecessary and (2) does a thing
      related to something that I am already interested in.
    </p>
    <p>
      To the right is the robot generator that Bill originally posted on{" "}
      <a
        href="https://www.instagram.com/billmakingstuff/p/DUnPyzxiE3v/"
        target="_blank"
      >
        his instagram
      </a>
      , and I've added a few features to it.
    </p>
    <p>
      First off, each "part" of the robot is clickable, and clicking on it will
      select it. The selected item for each region is highlighted with a border, 
      and the name of the selected item is displayed in the sidebar. You can
      also click on the name of the selected item in the sidebar to deselect it.
    </p>
    <p>
      Second, I've added a randomizer. You can click the "Randomize All"
      button to select a random item for each region. You can also click
      the "Randomize" button on each region to select a random item for
      that specific region.
    </p>
    <p>Anyone have a good favicon i can use?</p>
    <p>
      <a href="https://github.com/gaberankin/bigbotbash2026" className="flex items-center" target="_blank">
        <img src={githubIconImage} alt="GitHub Icon" className="w-4 h-4 inline align-middle mr-2" />
        Check out the code on GitHub!
      </a>
    </p>
  </>;
}