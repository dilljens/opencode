// ─── Typing Game ──────────────────────────────────────────────────────
// Built-in TUI plugin: typing speed test rendered as a dialog overlay.
// Defaults to Bible verses mode, Tab toggles words.
// ──────────────────────────────────────────────────────────────────────

import type { TuiPlugin } from "@opencode-ai/plugin/tui"
import { createSignal, Show } from "solid-js"
import { useKeyboard, useTerminalDimensions } from "@opentui/solid"
import type { KeyEvent } from "@opentui/core"
import type { BuiltinTuiPlugin } from "../builtins"

const WORDS = [
  "the","and","for","are","but","not","you","all","can","had","her",
  "one","our","out","has","have","been","some","them","then","what",
  "when","from","they","this","that","with","each","make","like","time",
  "just","know","take","come","into","over","such","more","also",
  "back","same","well","even","here","very","your","only","high",
  "long","down","away","good","safe","fast","kind","open","hard",
  "easy","soon","dark","door","hand","keep","last","left","life",
  "look","love","most","name","need","next","once","play","read",
  "real","road","room","side","city","book","care","cold","deep",
  "about","after","again","allow","along","among","begin",
  "below","break","brief","bring","broad","build","carry","catch",
  "cause","chair","chief","child","claim","clean","clear","close",
  "count","cover","craft","crash","crazy","cream","crime","cross",
  "crowd","daily","dance","depth","dirty","doubt","draft","drain",
  "dream","dress","drink","drive","early","earth","eight","empty",
  "enjoy","enter","equal","event","every","exact","exist","extra",
  "faith","false","field","fight","final","first","fixed","flash",
  "float","flood","floor","focus","force","fresh","front","fruit",
  "fully","ghost","giant","given","glass","globe","going","grace",
  "grade","grand","grant","grass","grave","great","green","group",
  "guard","guess","guide","heart","heavy","hello","honey","honor",
  "horse","hotel","house","human","ideal","image","index","inner",
  "input","issue","joint","judge","juice","knife","knock","known",
  "label","large","later","laugh","learn","lease","leave","level",
  "light","limit","local","logic","loose","lover","lower","lucky",
  "magic","major","maker","march","match","media","mercy","merge",
  "metal","meter","might","minor","mixed","model","money","month",
  "moral","motor","mount","mouse","mouth","movie","music","never",
  "night","noble","noise","north","noted","novel","nurse","occur",
  "pilot","plain","plant","plate","point","power","press","price",
  "prime","print","prior","proof","proud","prove","queen","quick",
  "quiet","quite","quote","radio","raise","range","rapid","ratio",
  "reach","refer","reply","right","rough","round","route","ruler",
  "scale","scene","scope","score","sense","serve","seven","shake",
  "shape","share","sharp","sheet","shift","shine","shirt","shock",
  "shoot","shore","short","sight","skill","sleep","slice","slide",
  "small","smart","smell","smile","smoke","snake","solid","solve",
  "sorry","sound","south","space","spare","speak","speed","spend",
  "split","sport","spread","spring","square","stable","staff","stage",
  "stand","stare","start","state","steal","steam","steel","steep",
  "stick","still","stock","stone","store","storm","story","stove",
  "style","sugar","sweet","swift","swing","table","taste","theme",
  "there","thick","thing","think","third","those","three","throw",
  "tight","timer","tired","title","today","token","total","touch",
  "tough","tower","trace","track","trade","trail","train","treat",
  "trend","trial","tribe","trick","trunk","trust","truth","twice",
  "twist","under","union","unite","unity","until","upper","upset",
  "urban","usage","usual","valid","value","verse","video","visit",
  "vital","vivid","vocal","voice","voter","waste","watch","water",
  "wheat","wheel","where","which","while","white","whole","whose",
  "women","world","worry","worse","worst","worth","would","wound",
  "write","wrote","young","youth",
];

const BIBLE_VERSES = [
  "In the beginning God created the heavens and the earth",
  "The Lord is my shepherd I shall not want",
  "For God so loved the world that He gave His only Son",
  "I can do all things through Christ who strengthens me",
  "Be strong and courageous do not be afraid",
  "Trust in the Lord with all your heart",
  "The steadfast love of the Lord never ceases",
  "Your word is a lamp to my feet and a light to my path",
  "Fear not for I am with you",
  "The Lord bless you and keep you",
  "Seek first the kingdom of God and His righteousness",
  "Love your neighbor as yourself",
  "Be still and know that I am God",
  "The grass withers and the flowers fall but the word of God stands forever",
  "I have fought the good fight I have finished the race I have kept the faith",
  "Delight yourself in the Lord and He will give you the desires of your heart",
  "The peace of God which surpasses all understanding will guard your hearts",
  "God is our refuge and strength an ever present help in trouble",
  "Rejoice always pray without ceasing give thanks in all circumstances",
  "Walk by faith not by sight",
  "Let the words of my mouth and the meditation of my heart be acceptable in Your sight",
  "The Lord is my light and my salvation whom shall I fear",
  "Create in me a clean heart O God and renew a right spirit within me",
  "The heavens declare the glory of God and the sky above proclaims His handiwork",
  "Bless the Lord O my soul and forget not all His benefits",
  "Taste and see that the Lord is good",
  "Commit your work to the Lord and your plans will be established",
  "A gentle answer turns away wrath but a harsh word stirs up anger",
  "The fear of the Lord is the beginning of wisdom",
  "A cheerful heart is good medicine",
  "Where there is no vision the people perish",
  "The path of the righteous is like the morning sun shining ever brighter",
  "A friend loves at all times",
  "Pride goes before destruction and a haughty spirit before a fall",
  "Train up a child in the way he should go and when he is old he will not depart from it",
  "The generous will themselves be blessed",
  "Do not boast about tomorrow for you do not know what a day may bring",
  "Whoever pursues righteousness and kindness will find life righteousness and honor",
  "The name of the Lord is a strong tower the righteous run into it and are safe",
  "A word fitly spoken is like apples of gold in a setting of silver",
  "Therefore encourage one another and build one another up",
  "Let no corrupting talk come out of your mouths but only such as is good for building up",
  "Be kind to one another tenderhearted forgiving one another as God in Christ forgave you",
  "Do not be anxious about anything but in everything by prayer let your requests be made known to God",
  "Whatever is true whatever is honorable whatever is just whatever is pure think about these things",
  "Let love be genuine",
  "Live in harmony with one another",
  "Do not be overcome by evil but overcome evil with good",
  "The greatest of these is love",
  "Therefore if anyone is in Christ he is a new creation",
  "Let us not grow weary of doing good",
  "The light shines in the darkness and the darkness has not overcome it",
  "And the Word became flesh and dwelt among us",
  "From His fullness we have all received grace upon grace",
  "The true light which gives light to everyone was coming into the world",
  "But to all who did receive Him who believed in His name He gave the right to become children of God",
  "For the law was given through Moses grace and truth came through Jesus Christ",
  "No one has ever seen God the only God who is at the Father side He has made Him known",
  "Behold the Lamb of God who takes away the sin of the world",
  "You are the light of the world a city set on a hill cannot be hidden",
  "Let your light shine before others so that they may see your good works",
  "Blessed are the poor in spirit for theirs is the kingdom of heaven",
  "Blessed are those who mourn for they shall be comforted",
  "Blessed are the meek for they shall inherit the earth",
  "Blessed are those who hunger and thirst for righteousness for they shall be satisfied",
  "Blessed are the merciful for they shall receive mercy",
  "Blessed are the pure in heart for they shall see God",
  "Blessed are the peacemakers for they shall be called sons of God",
  "Blessed are those who are persecuted for righteousness sake for theirs is the kingdom of heaven",
  "Do not lay up for yourselves treasures on earth",
  "For where your treasure is there your heart will be also",
  "No one can serve two masters",
  "Therefore do not be anxious about tomorrow for tomorrow will be anxious about itself",
  "Ask and it will be given to you seek and you will find knock and it will be opened to you",
  "Whatever you wish that others would do to you do also to them",
  "Come to me all who labor and are heavy laden and I will give you rest",
  "Take my yoke upon you and learn from me for I am gentle and lowly in heart",
  "Man shall not live by bread alone but by every word that comes from the mouth of God",
  "Do not think that I have come to abolish the Law or the Prophets I have not come to abolish them but to fulfill them",
  "Let your yes be yes and your no be no",
  "Love your enemies and pray for those who persecute you",
  "Be perfect therefore as your heavenly Father is perfect",
  "Judge not that you be not judged",
  "Why do you see the speck that is in your brother eye but do not notice the log that is in your own eye",
  "Do not give dogs what is holy and do not throw your pearls before pigs",
  "Enter by the narrow gate for the gate is wide and the way is easy that leads to destruction",
  "Beware of false prophets who come to you in sheep clothing but inwardly are ravenous wolves",
  "A healthy tree cannot bear bad fruit nor can a diseased tree bear good fruit",
  "Everyone then who hears these words of mine and does them will be like a wise man who built his house on the rock",
  "The harvest is plentiful but the laborers are few",
  "Be wise as serpents and innocent as doves",
  "Do not fear those who kill the body but cannot kill the soul",
  "The Son of Man came not to be served but to serve and to give His life as a ransom for many",
  "He who is not with Me is against Me",
  "The tree is known by its fruit",
  "Out of the abundance of the heart the mouth speaks",
  "The good person out of his good treasure brings forth good",
  "Anyone who does not take his cross and follow Me is not worthy of Me",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let wp = shuffle(WORDS);
let vp = shuffle(BIBLE_VERSES);
let wi = 0, vi = 0;

function pickWords(n) {
  const r = [];
  for (let i = 0; i < n; i++) {
    if (wi >= wp.length) { wp = shuffle(WORDS); wi = 0; }
    r.push(wp[wi++]);
  }
  return r;
}

function pickVerses(n) {
  const r = [];
  for (let i = 0; i < n; i++) {
    if (vi >= vp.length) { vp = shuffle(BIBLE_VERSES); vi = 0; }
    r.push(vp[vi++]);
  }
  return r;
}

type Mode = "verses" | "words";

// ─── Game Component ─────────────────────────────────────────────────────

function Game(props) {
  const [mode, setMode] = createSignal("verses");
  const [phase, setPhase] = createSignal("ready");
  const [chars, setChars] = createSignal([]);
  const [pos, setPos] = createSignal(0);
  const [g, setG] = createSignal(0);
  const [b, setB] = createSignal(0);
  const [tl, setTl] = createSignal(30);
  const [wpm, setWpm] = createSignal(0);
  const [acc, setAcc] = createSignal(100);
  const dims = useTerminalDimensions();

  let ts = 0;
  let timer = null;

  function getText(m) {
    if (m === "words") return pickWords(60).join(" ");
    return pickVerses(15).join("  ");
  }

  function pick(m) {
    return getText(m).split("").map((c) => ({ c, s: "u" }));
  }

  function upd() {
    const e = Math.max((30 - tl()) / 60, 0.01);
    const t = g() + b();
    setWpm(t > 0 ? Math.round((t / 5) / e) : 0);
    setAcc(t > 0 ? Math.round((g() / t) * 100) : 100);
  }

  function end() {
    if (timer) { clearInterval(timer); timer = null; }
    upd();
    setPhase("done");
  }

  function restart(m) {
    const nc = pick(m);
    setChars(nc); setPos(0); setG(0); setB(0); setTl(30); setWpm(0); setAcc(100);
    ts = Date.now();
    setPhase("play");
    timer = setInterval(() => {
      setTl((v) => { if (v <= 1) { end(); return 0; } return v - 1; });
      upd();
    }, 1000);
  }

  useKeyboard((e) => {
    if (e.repeated) return;
    if (e.name === "escape") { if (timer) clearInterval(timer); props.onDone(); return; }

    if (phase() === "done") {
      if (e.name === "enter" || e.name === "return") restart(mode());
      return;
    }

    if (phase() === "ready") {
      if (e.name === "tab") { setMode((m) => m === "words" ? "verses" : "words"); return; }
      restart(mode());
      return;
    }

    if (phase() === "play") {
      const p = pos();
      if (e.name === "backspace") {
        if (p > 0) {
          const prev = chars()[p - 1];
          if (prev.s === "g") setG((n) => n - 1);
          if (prev.s === "b") setB((n) => n - 1);
          const nc = [...chars()]; nc[p - 1] = { ...nc[p - 1], s: "u" };
          setChars(nc); setPos(p - 1);
        }
        upd(); return;
      }
      if (e.sequence && e.sequence.length === 1 && p < chars().length) {
        const ok = e.sequence === chars()[p].c;
        const nc = [...chars()]; nc[p] = { ...nc[p], s: ok ? "g" : "b" };
        setChars(nc);
        if (ok) setG((n) => n + 1); else setB((n) => n + 1);
        setPos(p + 1);
        upd();
      }
    }
  });

  const colors = {
    correct: "#00ff00",
    wrong: "#ff4444",
    cursor: "#ffffff",
    muted: "#888888",
    text: "#cccccc",
    border: "#555555",
  };

  function lines() {
    const all = chars();
    const maxW = Math.max(dims().width - 8, 20);
    const res = [];
    let i = 0;
    while (i < all.length) {
      const ln = [];
      let w = 0;
      while (i < all.length && w < maxW) {
        ln.push({ ch: all[i].c, s: all[i].s, gi: i });
        w += 1;
        i++;
      }
      if (ln.length) res.push(ln);
    }
    return res;
  }

  return (
    <box width="100%" height="100%" flexDirection="column" padding={1}>
      <box flexDirection="row" justifyContent="space-between" paddingBottom={1}>
        <text bold>⌨ Typing Game</text>
        <box flexDirection="row" gap={2}>
          <text>{mode() === "verses" ? "📖 Bible" : "📝 Words"}</text>
          <text>{phase() === "play" ? `⏱ ${tl()}s` : ""}</text>
        </box>
      </box>
      <box borderStyle="single" flexDirection="column" padding={1} flexGrow={1}>
        <Show when={phase() === "ready"}>
          <box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
            <text bold style={{ fg: colors.text }}>Typing Speed Test</text>
            <text> </text>
            <text style={{ fg: colors.text }}>Type any key to start</text>
            <text style={{ fg: colors.muted }}>30s · Backspace to undo · Tab switch mode</text>
            <text> </text>
            <text style={{ fg: colors.muted }}>Mode: {mode() === "words" ? "Random Words" : "Bible Verses"}</text>
            <text> </text>
            <text style={{ fg: colors.muted }}>[Esc] close  [Ctrl+O] toggle</text>
          </box>
        </Show>
        <Show when={phase() === "play"}>
          <box flexDirection="column" flexGrow={1}>
            <box flexDirection="row" gap={1}>
              <text style={{ fg: colors.muted }}>WPM: {wpm()}  ✓ {acc()}%  {pos()}/{chars().length}</text>
            </box>
            <box flexDirection="column" flexGrow={1} justifyContent="center">
              {lines().map((ln) => (
                <text>
                  {ln.map((ci) => {
                    const cur = ci.gi === pos();
                    let fg = colors.muted;
                    if (ci.s === "g") fg = colors.correct;
                    else if (ci.s === "b") fg = colors.wrong;
                    else if (cur) fg = colors.cursor;
                    return <span style={{ fg }} {...(cur ? { bold: true } : {})}>{ci.ch}</span>;
                  })}
                </text>
              ))}
            </box>
            <text style={{ fg: colors.muted }}>✓ {g()}  ✗ {b()}  Bksp=undo  Esc=close</text>
          </box>
        </Show>
        <Show when={phase() === "done"}>
          <box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
            <text bold style={{ fg: colors.text }}>⏱ Time's Up!</text>
            <text> </text>
            <box flexDirection="column">
              <text>WPM: {wpm()}</text>
              <text>Accuracy: {acc()}%</text>
              <text>Chars: {pos()}/{chars().length}</text>
              <text>Score: {Math.round(wpm() * (acc() / 100))}</text>
            </box>
            <text> </text>
            <text style={{ fg: colors.muted }}>[Enter] Play Again  [Esc] Close</text>
          </box>
        </Show>
      </box>
      <text style={{ fg: colors.muted }}>Ctrl+O toggle · Esc close · Backspace undo · Tab switch mode</text>
    </box>
  );
}

// ─── Plugin Entry ───────────────────────────────────────────────────────

const tui = async (api) => {
  api.keymap.registerLayer({
    commands: [
      {
        name: "typing-game",
        title: "Typing Game",
        description: "Typing speed test (words or Bible verses)",
        category: "Games",
        namespace: "palette",
        slashName: "typing-game",
        slashAliases: ["tg", "type", "bible"],
        run() {
          api.ui.dialog.setSize("xlarge");
          api.ui.dialog.replace(() => <Game onDone={() => api.ui.dialog.clear()} />);
        },
      },
    ],
    bindings: [
      { key: "ctrl+o", cmd: "typing-game", desc: "Toggle typing game" },
    ],
  });
};

const plugin = {
  id: "typing-game",
  tui,
};

export default plugin;
