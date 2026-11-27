=== jsx | beginner | JSX Basics
--- theory
**JSX** is a syntax extension that lets you write HTML-like markup inside JavaScript. Babel compiles it into `React.createElement(...)` calls.

```jsx
const el = <h1 className="title">Hello</h1>;
// compiles to:
const el = React.createElement("h1", { className: "title" }, "Hello");
```

Rules worth memorising:

- Return **one root element** (wrap siblings in `<>...</>`, a *Fragment*).
- Use `className` instead of `class`, and `htmlFor` instead of `for`.
- Close every tag: `<img />`, `<br />`.
- Put any JavaScript **expression** inside `{ }` — variables, math, function calls, ternaries. Statements like `if`/`for` are not expressions.
- Attributes are camelCase: `onClick`, `tabIndex`, `style={{ fontSize: 12 }}`.

In this lab you define a component named `App`; it is rendered automatically.
--- demo
function App() {
  const name = "React learner";
  const year = new Date().getFullYear();
  return (
    <>
      <h1>Hello, {name}! 👋</h1>
      <p>2 + 3 = {2 + 3}</p>
      <p>It is {year}. Uppercase: {name.toUpperCase()}</p>
    </>
  );
}
--- task
Render an `<h1>` with the text **Hello, React** and a `<p id="sum">` that displays the result of `7 * 6` computed with a JSX expression.
--- starter
function App() {
  return (
    <div>
      {/* your markup here */}
    </div>
  );
}
--- solution
function App() {
  return (
    <div>
      <h1>Hello, React</h1>
      <p id="sum">{7 * 6}</p>
    </div>
  );
}
--- explain
Text goes directly between tags; `{7 * 6}` is evaluated as JavaScript and its result (42) is rendered as text.
--- check: The h1 says "Hello, React"
return text('h1') === 'Hello, React';
--- check: #sum shows 42
return text('#sum') === '42';

=== components | beginner | Components & Composition
--- theory
A **component** is a JavaScript function that returns JSX. Component names **must start with a capital letter** — lowercase tags are treated as HTML elements.

```jsx
function Avatar() {
  return <img src="/me.png" alt="me" />;
}
function Profile() {
  return (
    <section>
      <Avatar />
      <h2>Ada Lovelace</h2>
    </section>
  );
}
```

You build UIs by **composing** small components into bigger ones. Keep components *pure*: given the same inputs they should return the same JSX, and never mutate outside variables during render.

Never define a component inside another component — it gets re-created every render and loses its state.
--- demo
function Logo() {
  return <strong style={{ color: "#4f46e5" }}>◆ LearnLab</strong>;
}
function Nav() {
  return (
    <nav style={{ display: "flex", gap: 12 }}>
      <Logo />
      <a href="#">Home</a>
      <a href="#">Docs</a>
    </nav>
  );
}
function App() {
  return (
    <div>
      <Nav />
      <p>Composed from small components.</p>
    </div>
  );
}
--- task
Create two components: `Header` that renders `<header>My Site</header>` and `Footer` that renders `<footer>© 2026</footer>`. `App` must render both, with a `<main>Content</main>` between them.
--- starter
// Define Header and Footer here

function App() {
  return (
    <div>
      {/* use them here */}
    </div>
  );
}
--- solution
function Header() {
  return <header>My Site</header>;
}
function Footer() {
  return <footer>© 2026</footer>;
}
function App() {
  return (
    <div>
      <Header />
      <main>Content</main>
      <Footer />
    </div>
  );
}
--- explain
Each component is a plain function. `App` composes them by using them like HTML tags: `<Header />`.
--- check: <header> contains "My Site"
return text('header') === 'My Site';
--- check: <footer> contains "© 2026"
return text('footer') === '© 2026';
--- check: main sits between header and footer
const kids = [...$('header').parentElement.children].map(e => e.tagName);
return kids.join(',') === 'HEADER,MAIN,FOOTER';

=== props | beginner | Props
--- theory
**Props** are the inputs of a component — like function arguments. The parent passes them as attributes; the child receives one object.

```jsx
function Badge({ label, color = "gray" }) {   // destructuring + default value
  return <span className="badge" style={{ background: color }}>{label}</span>;
}

<Badge label="New" color="tomato" />
<Badge label="Draft" />            // color falls back to "gray"
```

Key facts:

- Props are **read-only**. Never modify them; derive new values instead.
- Any value can be a prop: strings, numbers (`count={3}`), arrays, objects, functions, even JSX.
- Spread an object into props with `<Badge {...data} />`.
--- demo
function Badge({ label, color = "#6B7280" }) {
  return (
    <span style={{ background: color, color: "white", padding: "2px 8px", borderRadius: 12, marginRight: 6 }}>
      {label}
    </span>
  );
}
function App() {
  return (
    <div>
      <Badge label="New" color="#f43f5e" />
      <Badge label="Stable" color="#14b8a6" />
      <Badge label="Default" />
    </div>
  );
}
--- task
Create a `Greeting` component that receives `name` and an optional `greeting` prop (default **"Hello"**) and renders `<p className="greet">{greeting}, {name}!</p>`. Render it twice: once with `name="Ana"` and once with `name="Ben" greeting="Hi"`.
--- starter
function Greeting(props) {
  return <p className="greet"></p>;
}

function App() {
  return <div></div>;
}
--- solution
function Greeting({ name, greeting = "Hello" }) {
  return <p className="greet">{greeting}, {name}!</p>;
}

function App() {
  return (
    <div>
      <Greeting name="Ana" />
      <Greeting name="Ben" greeting="Hi" />
    </div>
  );
}
--- explain
Destructuring with a default (`greeting = "Hello"`) is the idiomatic way to declare optional props.
--- check: Two .greet paragraphs are rendered
return $$('.greet').length === 2;
--- check: First says "Hello, Ana!"
return $$('.greet')[0].textContent === 'Hello, Ana!';
--- check: Second says "Hi, Ben!"
return $$('.greet')[1].textContent === 'Hi, Ben!';

=== children | beginner | Children & Layout Components
--- theory
Whatever you put **between** a component's opening and closing tags arrives as the special prop `children`.

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

<Card title="Hi">
  <p>Anything can go here.</p>
</Card>
```

This is how you build reusable *layout* components (cards, modals, panels) without knowing their content in advance. It is the foundation of the **composition over inheritance** principle in React.
--- demo
function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid #E2E6ED", borderRadius: 8, padding: 12, marginBottom: 10 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}
function App() {
  return (
    <div>
      <Card title="Text"><p>Just a paragraph.</p></Card>
      <Card title="List"><ul><li>One</li><li>Two</li></ul></Card>
    </div>
  );
}
--- task
Write a `Panel` component that renders `<section className="panel">` containing an `<h2>` with its `title` prop followed by its `children`. In `App`, render a Panel titled **Notes** whose children are `<p>First</p>` and `<p>Second</p>`.
--- starter
function Panel({ title, children }) {
  return null;
}

function App() {
  return <Panel title="Notes"></Panel>;
}
--- solution
function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function App() {
  return (
    <Panel title="Notes">
      <p>First</p>
      <p>Second</p>
    </Panel>
  );
}
--- explain
`children` is rendered wherever you place `{children}` inside the component's JSX.
--- check: section.panel has h2 "Notes"
return text('.panel h2') === 'Notes';
--- check: Panel contains two paragraphs First and Second
return $$('.panel p').map(p => p.textContent).join('|') === 'First|Second';

=== state | beginner | State with useState
--- theory
**State** is data that changes over time and causes a re-render. Declare it with the `useState` hook:

```jsx
const [count, setCount] = useState(0);
```

- `count` is the current value for *this render*.
- `setCount(next)` schedules a re-render with a new value.
- When the next value depends on the previous one, use the **updater form**: `setCount(c => c + 1)`. Calling `setCount(count + 1)` three times in one handler only adds 1, because `count` is a snapshot!

Hooks rules: call them only at the top level of a component (never inside loops/conditions) and only from components or custom hooks.

Never mutate state objects/arrays directly — create new ones: `setUser({ ...user, name: "Ana" })`, `setItems([...items, newItem])`.
--- demo
function App() {
  const [count, setCount] = useState(0);
  const addThree = () => {
    setCount(c => c + 1);
    setCount(c => c + 1);
    setCount(c => c + 1);
  };
  return (
    <div>
      <h2>{count}</h2>
      <button onClick={() => setCount(count + 1)}>+1</button>{" "}
      <button onClick={addThree}>+3 (updater form)</button>
    </div>
  );
}
--- task
Build a counter: show the value in `<span id="count">`, and three buttons with ids `inc` (+1), `dec` (−1) and `reset` (back to 0). Start at 0.
--- starter
function App() {
  return (
    <div>
      <span id="count">0</span>
      <button id="inc">+</button>
      <button id="dec">-</button>
      <button id="reset">Reset</button>
    </div>
  );
}
--- solution
function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span id="count">{count}</span>
      <button id="inc" onClick={() => setCount(c => c + 1)}>+</button>
      <button id="dec" onClick={() => setCount(c => c - 1)}>-</button>
      <button id="reset" onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
--- explain
Each button calls the setter. The updater form `c => c + 1` is safe even when several updates are batched.
--- check: Starts at 0
return text('#count') === '0';
--- check: + three times shows 3
click('#inc'); click('#inc'); click('#inc'); await tick();
return text('#count') === '3';
--- check: − brings it to 2, reset to 0
click('#dec'); await tick();
const a = text('#count');
click('#reset'); await tick();
return a === '2' && text('#count') === '0';

=== events | beginner | Handling Events
--- theory
React events are camelCase props that take a **function**: `onClick={handleClick}` — not `onClick={handleClick()}` (that would call it during render!).

```jsx
function Form() {
  function handleSubmit(e) {
    e.preventDefault();          // stop the page reload
    alert("sent");
  }
  return (
    <form onSubmit={handleSubmit}>
      <button onClick={e => e.stopPropagation()}>Send</button>
    </form>
  );
}
```

- Pass arguments with an arrow: `onClick={() => remove(id)}`.
- The event object is a *SyntheticEvent* wrapping the native one, with the same API.
- Common events: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onMouseEnter`, `onFocus`, `onBlur`.
--- demo
function App() {
  const [log, setLog] = useState([]);
  const add = msg => setLog(l => [msg, ...l].slice(0, 5));
  return (
    <div>
      <button onClick={() => add("clicked")}>Click</button>{" "}
      <button onDoubleClick={() => add("double clicked")}>Double click</button>{" "}
      <input placeholder="press keys" onKeyDown={e => add("key: " + e.key)} />
      <ul>{log.map((l, i) => <li key={i}>{l}</li>)}</ul>
    </div>
  );
}
--- task
Create a button with id `toggle` whose label switches between **OFF** (initial) and **ON** each time it is clicked.
--- starter
function App() {
  return <button id="toggle">OFF</button>;
}
--- solution
function App() {
  const [on, setOn] = useState(false);
  return <button id="toggle" onClick={() => setOn(o => !o)}>{on ? "ON" : "OFF"}</button>;
}
--- explain
A boolean state flipped with `o => !o`; the label is derived with a ternary.
--- check: Initially OFF
return text('#toggle') === 'OFF';
--- check: Click → ON, click again → OFF
click('#toggle'); await tick(); const a = text('#toggle');
click('#toggle'); await tick();
return a === 'ON' && text('#toggle') === 'OFF';

=== conditional | beginner | Conditional Rendering
--- theory
Because JSX is just JavaScript, conditional UI uses normal JS:

```jsx
// ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// logical AND — render or nothing
{unread > 0 && <Badge count={unread} />}

// early return
if (!user) return <p>Loading…</p>;
```

⚠️ Pitfall: `{count && <List />}` renders **0** when count is 0. Use `{count > 0 && ...}`.

`null`, `undefined`, `true` and `false` render nothing.
--- demo
function App() {
  const [user, setUser] = useState(null);
  const [unread, setUnread] = useState(0);
  return (
    <div>
      {user ? <h3>Welcome, {user}!</h3> : <h3>Please sign in</h3>}
      <button onClick={() => setUser(user ? null : "Ana")}>{user ? "Log out" : "Log in"}</button>{" "}
      <button onClick={() => setUnread(u => u + 1)}>New message</button>
      {unread > 0 && <p>🔔 {unread} unread</p>}
    </div>
  );
}
--- task
Render a `<p id="msg">` showing **Please sign in** when logged out and **Welcome back!** when logged in, plus a button `#auth` labelled **Login** / **Logout** that toggles the state. Also show `<span id="admin">Admin</span>` *only* when logged in.
--- starter
function App() {
  return (
    <div>
      <p id="msg"></p>
      <button id="auth">Login</button>
    </div>
  );
}
--- solution
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div>
      <p id="msg">{loggedIn ? "Welcome back!" : "Please sign in"}</p>
      <button id="auth" onClick={() => setLoggedIn(v => !v)}>{loggedIn ? "Logout" : "Login"}</button>
      {loggedIn && <span id="admin">Admin</span>}
    </div>
  );
}
--- explain
Ternaries choose between two outputs; `&&` renders the admin badge only when the condition is true.
--- check: Logged out by default, no admin badge
return text('#msg') === 'Please sign in' && !$('#admin') && text('#auth') === 'Login';
--- check: After clicking Login shows welcome + admin
click('#auth'); await tick();
return text('#msg') === 'Welcome back!' && !!$('#admin') && text('#auth') === 'Logout';

=== lists | beginner | Lists & Keys
--- theory
Render arrays with `map`. Every item needs a stable, unique **`key`** among its siblings so React can match items between renders.

```jsx
const todos = [{ id: 1, text: "Learn" }, { id: 2, text: "Build" }];
<ul>
  {todos.map(t => <li key={t.id}>{t.text}</li>)}
</ul>
```

- Prefer IDs from your data. Using the array **index** as key breaks when items are inserted, removed or re-ordered (state gets attached to the wrong item).
- Keys only need to be unique among siblings, not globally.
- Filter before mapping: `items.filter(i => i.done).map(...)`.
--- demo
function App() {
  const [items, setItems] = useState([
    { id: 1, name: "Apple" }, { id: 2, name: "Banana" }, { id: 3, name: "Cherry" }
  ]);
  const [q, setQ] = useState("");
  const visible = items.filter(i => i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input placeholder="filter" value={q} onChange={e => setQ(e.target.value)} />
      <ul>{visible.map(i => <li key={i.id}>{i.name}</li>)}</ul>
      <button onClick={() => setItems([...items, { id: Date.now(), name: "Kiwi" }])}>Add Kiwi</button>
    </div>
  );
}
--- task
Given the `fruits` array, render a `<ul id="fruits">` with one `<li>` per fruit (use the id as key), and a `<p id="total">` saying **3 fruits**. Only fruits with `inStock: true` should be listed (but the total counts all).
--- starter
const fruits = [
  { id: "a", name: "Apple", inStock: true },
  { id: "b", name: "Banana", inStock: false },
  { id: "c", name: "Cherry", inStock: true },
];

function App() {
  return (
    <div>
      <ul id="fruits"></ul>
      <p id="total"></p>
    </div>
  );
}
--- solution
const fruits = [
  { id: "a", name: "Apple", inStock: true },
  { id: "b", name: "Banana", inStock: false },
  { id: "c", name: "Cherry", inStock: true },
];

function App() {
  return (
    <div>
      <ul id="fruits">
        {fruits.filter(f => f.inStock).map(f => <li key={f.id}>{f.name}</li>)}
      </ul>
      <p id="total">{fruits.length} fruits</p>
    </div>
  );
}
--- explain
`filter` then `map` to elements, each with `key={f.id}`.
--- check: Lists Apple and Cherry only
return $$('#fruits li').map(l => l.textContent).join(',') === 'Apple,Cherry';
--- check: Total reads "3 fruits"
return text('#total') === '3 fruits';
--- check: No missing-key warning in the console
return !logs.some(l => /unique "key"/.test(l));

=== forms | beginner | Controlled Forms
--- theory
A **controlled input** takes its value from state and reports changes with `onChange`. React becomes the single source of truth.

```jsx
const [email, setEmail] = useState("");
<input value={email} onChange={e => setEmail(e.target.value)} />
```

- Checkboxes use `checked` + `e.target.checked`.
- `<select>` and `<textarea>` work the same way with `value`.
- Handle `onSubmit` on the `<form>` and call `e.preventDefault()`.
- Derive things like "is the form valid?" during render instead of storing them in extra state.
--- demo
function App() {
  const [form, setForm] = useState({ name: "", plan: "free", agree: false });
  const update = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };
  return (
    <form onSubmit={e => { e.preventDefault(); alert(JSON.stringify(form)); }}>
      <input name="name" value={form.name} onChange={update} placeholder="name" />
      <select name="plan" value={form.plan} onChange={update}>
        <option value="free">Free</option><option value="pro">Pro</option>
      </select>
      <label><input type="checkbox" name="agree" checked={form.agree} onChange={update} /> agree</label>
      <button disabled={!form.name || !form.agree}>Submit</button>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}
--- task
Build a controlled `<input id="name">`. Echo its value in `<p id="echo">` as **Hello, {value}** (just **Hello, ** with nothing typed is fine). Add a `<button id="send">` that is **disabled** while the input is empty.
--- starter
function App() {
  return (
    <form>
      <input id="name" />
      <p id="echo"></p>
      <button id="send">Send</button>
    </form>
  );
}
--- solution
function App() {
  const [name, setName] = useState("");
  return (
    <form onSubmit={e => e.preventDefault()}>
      <input id="name" value={name} onChange={e => setName(e.target.value)} />
      <p id="echo">Hello, {name}</p>
      <button id="send" disabled={name.trim() === ""}>Send</button>
    </form>
  );
}
--- explain
The input value lives in state; the echo and the disabled flag are *derived* from it during render.
--- check: Button disabled initially
return $('#send').disabled === true;
--- check: Typing "Zoe" echoes "Hello, Zoe" and enables the button
type('#name', 'Zoe'); await tick();
return text('#echo') === 'Hello, Zoe' && $('#send').disabled === false;

=== styling | beginner | Styling: className & style
--- theory
Two built-in ways to style:

```jsx
// 1. CSS classes (preferred)
<button className={active ? "tab active" : "tab"}>Home</button>

// 2. Inline style objects — camelCase keys, numbers become px
<div style={{ backgroundColor: "#4f46e5", padding: 12 }} />
```

Build class strings conditionally with template literals or a helper: `` className={`btn ${primary ? "btn-primary" : ""}`} ``. In real projects you'll also meet CSS Modules, Tailwind, or CSS-in-JS — all end up setting `className` or `style`.
--- demo
function App() {
  const [active, setActive] = useState("home");
  const tabs = ["home", "about", "contact"];
  return (
    <div>
      <style>{`.tab{border:0;padding:6px 12px;margin-right:4px;border-radius:6px;background:#F5F7FA}
               .tab.active{background:#4f46e5;color:white}`}</style>
      {tabs.map(t => (
        <button key={t} className={t === active ? "tab active" : "tab"} onClick={() => setActive(t)}>{t}</button>
      ))}
      <p style={{ color: "#6B7280", fontStyle: "italic" }}>Current tab: {active}</p>
    </div>
  );
}
--- task
Render three buttons (class `opt`) labelled **S**, **M**, **L**. Clicking one gives *only that button* the extra class `selected`. Initially **M** is selected. Also render `<div id="box">` whose inline `width` is 50px for S, 100px for M and 150px for L.
--- starter
const sizes = { S: 50, M: 100, L: 150 };

function App() {
  return (
    <div>
      {Object.keys(sizes).map(s => <button key={s} className="opt">{s}</button>)}
      <div id="box" style={{ height: 20, background: "#14b8a6" }} />
    </div>
  );
}
--- solution
const sizes = { S: 50, M: 100, L: 150 };

function App() {
  const [size, setSize] = useState("M");
  return (
    <div>
      {Object.keys(sizes).map(s => (
        <button key={s} className={s === size ? "opt selected" : "opt"} onClick={() => setSize(s)}>{s}</button>
      ))}
      <div id="box" style={{ height: 20, width: sizes[size], background: "#14b8a6" }} />
    </div>
  );
}
--- explain
The selected size is state; the class and the inline width are both derived from it.
--- check: M selected initially, box is 100px
return $$('.opt.selected').map(b => b.textContent).join() === 'M' && $('#box').style.width === '100px';
--- check: Clicking L selects only L and widens the box
click($$('.opt')[2]); await tick();
return $$('.opt.selected').map(b => b.textContent).join() === 'L' && $('#box').style.width === '150px';

=== lifting-state | intermediate | Lifting State Up
--- theory
When two components need the **same** changing data, move the state to their closest common parent and pass it down via props (plus callbacks to change it). This is called *lifting state up*.

```jsx
function Parent() {
  const [value, setValue] = useState("");
  return (
    <>
      <Input value={value} onChange={setValue} />
      <Preview text={value} />
    </>
  );
}
```

Data flows **down** (props), events flow **up** (callbacks). There is a single source of truth, so the two children can never disagree.
--- demo
function Celsius({ value, onChange }) {
  return <label>°C <input value={value} onChange={e => onChange(e.target.value)} /></label>;
}
function Fahrenheit({ celsius }) {
  const f = celsius === "" || isNaN(celsius) ? "" : (celsius * 9 / 5 + 32).toFixed(1);
  return <p>°F: {f}</p>;
}
function App() {
  const [c, setC] = useState("20");
  return <div><Celsius value={c} onChange={setC} /><Fahrenheit celsius={c} /></div>;
}
--- task
Create a `Counter` child that receives `label` and `onAdd`, rendering a `<button className="add">` with the label. `App` renders two Counters (labels **+1** and **+5**) and a `<p id="total">` showing the shared total (start 0). Clicking +1 adds 1, +5 adds 5.
--- starter
function Counter({ label, onAdd }) {
  return <button className="add">{label}</button>;
}

function App() {
  return (
    <div>
      <Counter label="+1" />
      <Counter label="+5" />
      <p id="total">0</p>
    </div>
  );
}
--- solution
function Counter({ label, onAdd }) {
  return <button className="add" onClick={onAdd}>{label}</button>;
}

function App() {
  const [total, setTotal] = useState(0);
  return (
    <div>
      <Counter label="+1" onAdd={() => setTotal(t => t + 1)} />
      <Counter label="+5" onAdd={() => setTotal(t => t + 5)} />
      <p id="total">{total}</p>
    </div>
  );
}
--- explain
The total lives in `App`; each child only knows how to *ask* the parent to change it through `onAdd`.
--- check: Total starts at 0
return text('#total') === '0';
--- check: +1, +5, +5 → 11
const [one, five] = $$('.add');
click(one); click(five); click(five); await tick();
return text('#total') === '11';

=== use-effect | intermediate | Side Effects with useEffect
--- theory
`useEffect` synchronises a component with something **outside** React: the DOM title, timers, subscriptions, network.

```jsx
useEffect(() => {
  document.title = `Count: ${count}`;   // effect
  return () => { /* cleanup (optional) */ };
}, [count]);                              // dependency array
```

- No array → runs after **every** render.
- `[]` → runs once after mount (cleanup on unmount).
- `[a, b]` → runs when `a` or `b` changed.
- The cleanup runs before the next effect and on unmount.
- In development with StrictMode React runs effects twice to surface missing cleanups.

**You might not need an effect**: don't use effects to derive data from props/state — compute it during render.
--- demo
function App() {
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => { document.title = "Clicked " + count; }, [count]);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>
      <p>Window width: {width}px (resize the panel)</p>
    </div>
  );
}
--- task
Keep `document.title` in sync with a counter: it must read **Count: N**. Render a `<button id="inc">` that increments the count (start 0).
--- starter
function App() {
  const [count, setCount] = useState(0);
  return <button id="inc" onClick={() => setCount(c => c + 1)}>{count}</button>;
}
--- solution
function App() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);
  return <button id="inc" onClick={() => setCount(c => c + 1)}>{count}</button>;
}
--- explain
The effect depends on `count`, so it re-runs after each change and updates the title.
--- check: Title is "Count: 0" after mount
await tick();
return document.title === 'Count: 0';
--- check: After two clicks title is "Count: 2"
click('#inc'); click('#inc'); await tick(50);
return document.title === 'Count: 2';

=== timers | intermediate | Timers & Cleanup
--- theory
Intervals and subscriptions must be **cleaned up**, otherwise they keep running after the component is gone (memory leaks, "state update on unmounted component").

```jsx
useEffect(() => {
  if (!running) return;
  const id = setInterval(() => setSeconds(s => s + 1), 1000);
  return () => clearInterval(id);       // cleanup!
}, [running]);
```

Note the **updater form** `s => s + 1`: the interval callback captured the state from the render that created it (a *stale closure*). The updater always receives the latest value.
--- demo
function App() {
  const [ms, setMs] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setMs(m => m + 100), 100);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div>
      <h2>{(ms / 1000).toFixed(1)}s</h2>
      <button onClick={() => setRunning(r => !r)}>{running ? "Pause" : "Start"}</button>{" "}
      <button onClick={() => { setRunning(false); setMs(0); }}>Reset</button>
    </div>
  );
}
--- task
Build a stopwatch: `<span id="ticks">` shows a number that increases by 1 every **100 ms** while running. `<button id="start">` starts, `<button id="stop">` stops. It must not keep ticking after stop.
--- starter
function App() {
  const [ticks, setTicks] = useState(0);
  return (
    <div>
      <span id="ticks">{ticks}</span>
      <button id="start">Start</button>
      <button id="stop">Stop</button>
    </div>
  );
}
--- solution
function App() {
  const [ticks, setTicks] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTicks(t => t + 1), 100);
    return () => clearInterval(id);
  }, [running]);
  return (
    <div>
      <span id="ticks">{ticks}</span>
      <button id="start" onClick={() => setRunning(true)}>Start</button>
      <button id="stop" onClick={() => setRunning(false)}>Stop</button>
    </div>
  );
}
--- explain
The effect starts an interval only while `running` and its cleanup clears it when `running` flips or the component unmounts.
--- check: Ticks increase after start
click('#start'); await tick(450);
return Number(text('#ticks')) >= 2;
--- check: Ticks stop after stop
click('#stop'); await tick(50); const a = text('#ticks'); await tick(350);
return text('#ticks') === a;

=== fetching | intermediate | Data Fetching: loading & error states
--- theory
Fetching data is a side effect. Model the three states explicitly: **loading**, **error**, **data**.

```jsx
useEffect(() => {
  let ignore = false;                        // avoid race conditions
  setLoading(true);
  fetch(`/api/users?q=${q}`)
    .then(r => r.json())
    .then(d => { if (!ignore) setData(d); })
    .catch(e => { if (!ignore) setError(e); })
    .finally(() => { if (!ignore) setLoading(false); });
  return () => { ignore = true; };
}, [q]);
```

The `ignore` flag discards responses for outdated requests (or use `AbortController`). In real apps prefer a data library (**TanStack Query**, SWR) or a framework loader — they handle caching, retries and deduplication.

In this lab `api.getUsers(ms?, fail?)` returns a Promise of users after a delay.
--- demo
function App() {
  const [state, setState] = useState({ status: "loading" });
  const load = (fail = false) => {
    setState({ status: "loading" });
    api.getUsers(600, fail)
      .then(users => setState({ status: "ok", users }))
      .catch(err => setState({ status: "error", error: err.message }));
  };
  useEffect(() => { load(); }, []);
  return (
    <div>
      <button onClick={() => load()}>Reload</button>{" "}
      <button onClick={() => load(true)}>Simulate failure</button>
      {state.status === "loading" && <p>Loading…</p>}
      {state.status === "error" && <p style={{ color: "#f43f5e" }}>Error: {state.error}</p>}
      {state.status === "ok" && <ul>{state.users.map(u => <li key={u.id}>{u.name}</li>)}</ul>}
    </div>
  );
}
--- task
On mount call `api.getUsers(200)`. While waiting show `<p id="loading">Loading...</p>`. When it resolves, hide the loading text and render `<ul id="users">` with one `<li>` per user name.
--- starter
function App() {
  return <p id="loading">Loading...</p>;
}
--- solution
function App() {
  const [users, setUsers] = useState(null);
  useEffect(() => {
    let ignore = false;
    api.getUsers(200).then(u => { if (!ignore) setUsers(u); });
    return () => { ignore = true; };
  }, []);
  if (!users) return <p id="loading">Loading...</p>;
  return <ul id="users">{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
--- explain
`null` means "not loaded yet" → early-return the loading UI; once data arrives the list renders.
--- check: Shows Loading... first
return !!$('#loading') && !$('#users');
--- check: Renders the 4 users after loading
await tick(400);
return !$('#loading') && $$('#users li').length === 4;

=== use-ref | intermediate | useRef: DOM access & mutable values
--- theory
`useRef(initial)` returns a mutable object `{ current }` that **persists across renders without causing re-renders**.

Two main uses:

```jsx
// 1. Access a DOM node
const inputRef = useRef(null);
<input ref={inputRef} />
inputRef.current.focus();

// 2. Keep a mutable value (timer id, previous value, render counter)
const renders = useRef(0);
renders.current++;
```

Don't read or write `ref.current` during rendering for values that affect output — that's what state is for. Refs are an *escape hatch*.
--- demo
function App() {
  const inputRef = useRef(null);
  const renders = useRef(0);
  const [text, setText] = useState("");
  renders.current++;
  return (
    <div>
      <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>{" "}
      <button onClick={() => { setText(""); inputRef.current.focus(); }}>Clear</button>
      <p>Rendered {renders.current} times</p>
    </div>
  );
}
--- task
Render an `<input id="field">` and a `<button id="focus">`. Clicking the button must focus the input (use a ref).
--- starter
function App() {
  return (
    <div>
      <input id="field" />
      <button id="focus">Focus the field</button>
    </div>
  );
}
--- solution
function App() {
  const ref = useRef(null);
  return (
    <div>
      <input id="field" ref={ref} />
      <button id="focus" onClick={() => ref.current.focus()}>Focus the field</button>
    </div>
  );
}
--- explain
React fills `ref.current` with the DOM node after mount; calling `.focus()` is an imperative DOM action.
--- check: Clicking the button focuses the input
$('#focus').focus(); click('#focus'); await tick();
return document.activeElement === $('#field');

=== use-reducer | intermediate | useReducer for complex state
--- theory
When state updates depend on many actions, move the logic into a **reducer**: a pure function `(state, action) => newState`.

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "add":    return [...state, { id: Date.now(), text: action.text, done: false }];
    case "toggle": return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);
    default:       throw new Error("unknown action " + action.type);
  }
}
const [todos, dispatch] = useReducer(reducer, []);
dispatch({ type: "add", text: "Learn reducers" });
```

Benefits: all transitions in one place, easy to unit test, and `dispatch` is stable (safe to pass down). This is the same pattern Redux uses.
--- demo
function reducer(state, action) {
  switch (action.type) {
    case "inc": return { ...state, count: state.count + state.step };
    case "dec": return { ...state, count: state.count - state.step };
    case "step": return { ...state, step: action.step };
    case "reset": return { count: 0, step: 1 };
    default: return state;
  }
}
function App() {
  const [s, dispatch] = useReducer(reducer, { count: 0, step: 1 });
  return (
    <div>
      <h2>{s.count}</h2>
      <button onClick={() => dispatch({ type: "dec" })}>-</button>{" "}
      <button onClick={() => dispatch({ type: "inc" })}>+</button>{" "}
      <input type="number" value={s.step} onChange={e => dispatch({ type: "step", step: Number(e.target.value) })} />
      <button onClick={() => dispatch({ type: "reset" })}>reset</button>
    </div>
  );
}
--- task
Implement a todo list with `useReducer`. An `<input id="text">` + `<button id="add">` adds a todo (ignore empty text). Todos render as `<li className="todo">`; clicking a todo toggles the class `done` on it.
--- starter
function reducer(state, action) {
  switch (action.type) {
    default:
      return state;
  }
}

function App() {
  const [todos, dispatch] = useReducer(reducer, []);
  const [text, setText] = useState("");
  return (
    <div>
      <input id="text" value={text} onChange={e => setText(e.target.value)} />
      <button id="add">Add</button>
      <ul></ul>
    </div>
  );
}
--- solution
let nextId = 1;
function reducer(state, action) {
  switch (action.type) {
    case "add":
      return [...state, { id: nextId++, text: action.text, done: false }];
    case "toggle":
      return state.map(t => (t.id === action.id ? { ...t, done: !t.done } : t));
    default:
      return state;
  }
}

function App() {
  const [todos, dispatch] = useReducer(reducer, []);
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    dispatch({ type: "add", text });
    setText("");
  };
  return (
    <div>
      <input id="text" value={text} onChange={e => setText(e.target.value)} />
      <button id="add" onClick={add}>Add</button>
      <ul>
        {todos.map(t => (
          <li key={t.id} className={t.done ? "todo done" : "todo"} onClick={() => dispatch({ type: "toggle", id: t.id })}>
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
--- explain
The reducer returns new arrays (`[...state, x]`, `state.map`) — never mutating. Components only `dispatch` intent.
--- check: Empty text adds nothing
click('#add'); await tick();
return $$('.todo').length === 0;
--- check: Adding two todos renders two items
type('#text', 'Read'); await tick(); click('#add'); await tick();
type('#text', 'Write'); await tick(); click('#add'); await tick();
return $$('.todo').map(t => t.textContent).join() === 'Read,Write';
--- check: Clicking a todo toggles done
click($$('.todo')[1]); await tick();
return !$$('.todo')[0].classList.contains('done') && $$('.todo')[1].classList.contains('done');

=== context | intermediate | Context: avoiding prop drilling
--- theory
**Context** passes data deep into the tree without threading props through every level.

```jsx
const ThemeContext = createContext("light");          // 1. create (with default)

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={theme}>             {/* 2. provide */}
      <Toolbar />
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext);               // 3. consume
  return <button className={theme}>OK</button>;
}
```

- Every consumer re-renders when the provider `value` changes — memoize object values with `useMemo`.
- Good for: theme, current user, locale, feature flags. Not a replacement for all state management.
- Pair with `useReducer` to provide `state` and `dispatch` app-wide.
--- demo
const ThemeContext = createContext("light");
function Panel() {
  const theme = useContext(ThemeContext);
  const style = theme === "dark" ? { background: "#1e1e2e", color: "white" } : { background: "#F5F7FA" };
  return <div style={{ ...style, padding: 12, borderRadius: 8 }}>The theme is <b>{theme}</b></div>;
}
function Layout() { return <div><Panel /></div>; }   // no props passed!
function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={theme}>
      <button onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}>Toggle theme</button>
      <Layout />
    </ThemeContext.Provider>
  );
}
--- task
Create a `UserContext`. `App` holds `user` state (initially **"Guest"**) and provides it. A deeply nested `Greeting` component (rendered inside `Layout`, which takes **no props**) shows `<p id="hello">Hi, {user}</p>`. A `<button id="login">` in App sets the user to **"Ana"**.
--- starter
function Greeting() {
  return <p id="hello">Hi, ?</p>;
}
function Layout() {
  return <div><Greeting /></div>;
}
function App() {
  return (
    <div>
      <button id="login">Login</button>
      <Layout />
    </div>
  );
}
--- solution
const UserContext = createContext("Guest");

function Greeting() {
  const user = useContext(UserContext);
  return <p id="hello">Hi, {user}</p>;
}
function Layout() {
  return <div><Greeting /></div>;
}
function App() {
  const [user, setUser] = useState("Guest");
  return (
    <UserContext.Provider value={user}>
      <button id="login" onClick={() => setUser("Ana")}>Login</button>
      <Layout />
    </UserContext.Provider>
  );
}
--- explain
`Layout` never touches the user; `Greeting` reads it straight from the nearest Provider.
--- check: Shows "Hi, Guest" initially
return text('#hello') === 'Hi, Guest';
--- check: After login shows "Hi, Ana"
click('#login'); await tick();
return text('#hello') === 'Hi, Ana';

=== custom-hooks | intermediate | Custom Hooks
--- theory
A **custom hook** is a function whose name starts with `use` and that calls other hooks. It lets you reuse *stateful logic* (not UI) between components.

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(o => !o), []);
  return [on, toggle];
}

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => JSON.parse(localStorage.getItem(key)) ?? initial);
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue];
}
```

Each component calling the hook gets its **own independent state**. Popular examples: `useDebounce`, `useFetch`, `useMediaQuery`, `useOnClickOutside`.
--- demo
function useDebounce(value, ms) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}
function App() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 500);
  return (
    <div>
      <input placeholder="type fast…" value={q} onChange={e => setQ(e.target.value)} />
      <p>Instant: {q}</p>
      <p>Debounced (500ms): {dq}</p>
    </div>
  );
}
--- task
Write a custom hook `useCounter(initial, step)` that returns `{ count, inc, dec }`. Use it **twice** in App: counter A starts at 0 with step 1 (`#a`, `#a-inc`), counter B starts at 10 with step 5 (`#b`, `#b-dec`).
--- starter
function useCounter(initial = 0, step = 1) {
  // ...
}

function App() {
  return (
    <div>
      <span id="a">0</span> <button id="a-inc">A+</button>
      <span id="b">10</span> <button id="b-dec">B-</button>
    </div>
  );
}
--- solution
function useCounter(initial = 0, step = 1) {
  const [count, setCount] = useState(initial);
  const inc = () => setCount(c => c + step);
  const dec = () => setCount(c => c - step);
  return { count, inc, dec };
}

function App() {
  const a = useCounter(0, 1);
  const b = useCounter(10, 5);
  return (
    <div>
      <span id="a">{a.count}</span> <button id="a-inc" onClick={a.inc}>A+</button>
      <span id="b">{b.count}</span> <button id="b-dec" onClick={b.dec}>B-</button>
    </div>
  );
}
--- explain
Two calls → two independent states. The hook encapsulates the logic; App only wires it to the UI.
--- check: Initial values 0 and 10
return text('#a') === '0' && text('#b') === '10';
--- check: A+ twice → 2, B- once → 5, independently
click('#a-inc'); click('#a-inc'); click('#b-dec'); await tick();
return text('#a') === '2' && text('#b') === '5';

=== memoization | intermediate | Performance: memo, useMemo, useCallback
--- theory
By default, when a parent re-renders **all its children re-render** too. Usually that's fine. When it isn't:

- `React.memo(Component)` — skip re-rendering if props are shallowly equal.
- `useMemo(() => compute(a, b), [a, b])` — cache an expensive *value*.
- `useCallback(fn, deps)` — cache a *function* identity so memoized children don't see a "new" prop each render.

```jsx
const List = memo(function List({ items, onPick }) { ... });

function App() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("light");
  const filtered = useMemo(() => bigList.filter(i => i.includes(query)), [query]);
  const onPick = useCallback(id => console.log(id), []);
  return <List items={filtered} onPick={onPick} />;   // theme change won't re-render List
}
```

Measure first (React DevTools Profiler). Over-memoizing adds complexity. The new **React Compiler** can auto-memoize for you.
--- demo
const Child = memo(function Child({ onClick }) {
  const renders = useRef(0);
  renders.current++;
  return <button onClick={onClick}>Memo child (rendered {renders.current}×)</button>;
});
function App() {
  const [n, setN] = useState(0);
  const [other, setOther] = useState(0);
  const stable = useCallback(() => setN(x => x + 1), []);
  return (
    <div>
      <p>n = {n}, other = {other}</p>
      <Child onClick={stable} />
      <button onClick={() => setOther(o => o + 1)}>Re-render parent</button>
      <p>Click "Re-render parent": the memo child's counter stays the same.</p>
    </div>
  );
}
--- task
`ExpensiveList` increments `window.renders` every time it renders. Make it **not** re-render when the unrelated `#other` button is clicked: wrap it in `memo` and give it a stable `onSelect` (useCallback) and `items` (useMemo). Clicking an item must still update `<p id="picked">`.
--- starter
window.renders = 0;
const ExpensiveList = function ExpensiveList({ items, onSelect }) {
  window.renders++;
  return <ul>{items.map(i => <li key={i} className="item" onClick={() => onSelect(i)}>{i}</li>)}</ul>;
};

function App() {
  const [picked, setPicked] = useState("none");
  const [other, setOther] = useState(0);
  const items = ["red", "green", "blue"].map(s => s.toUpperCase());
  const onSelect = item => setPicked(item);
  return (
    <div>
      <button id="other" onClick={() => setOther(o => o + 1)}>other {other}</button>
      <p id="picked">{picked}</p>
      <ExpensiveList items={items} onSelect={onSelect} />
    </div>
  );
}
--- solution
window.renders = 0;
const ExpensiveList = memo(function ExpensiveList({ items, onSelect }) {
  window.renders++;
  return <ul>{items.map(i => <li key={i} className="item" onClick={() => onSelect(i)}>{i}</li>)}</ul>;
});

function App() {
  const [picked, setPicked] = useState("none");
  const [other, setOther] = useState(0);
  const items = useMemo(() => ["red", "green", "blue"].map(s => s.toUpperCase()), []);
  const onSelect = useCallback(item => setPicked(item), []);
  return (
    <div>
      <button id="other" onClick={() => setOther(o => o + 1)}>other {other}</button>
      <p id="picked">{picked}</p>
      <ExpensiveList items={items} onSelect={onSelect} />
    </div>
  );
}
--- explain
`memo` compares props shallowly. Without `useMemo`/`useCallback`, `items` and `onSelect` are new objects every render, so memo would never skip.
--- check: Clicking #other 3× does not re-render the list
await tick(); const before = window.renders;
click('#other'); click('#other'); click('#other'); await tick();
return window.renders === before;
--- check: Selecting an item still works
click($$('.item')[2]); await tick();
return text('#picked') === 'BLUE';

=== validation | intermediate | Form Validation Patterns
--- theory
Validation is usually **derived state**: compute errors from the current values during render, and only *show* them after the user interacted (`touched`) or tried to submit.

```jsx
const errors = {};
if (!/^\S+@\S+\.\S+$/.test(values.email)) errors.email = "Invalid email";
if (values.password.length < 8) errors.password = "Min 8 characters";
const isValid = Object.keys(errors).length === 0;
```

Accessibility tips: link messages with `aria-describedby`, set `aria-invalid`, and move focus to the first invalid field on submit. Libraries such as **React Hook Form** + **Zod** scale this pattern for big forms.
--- demo
function App() {
  const [v, setV] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const errors = {};
  if (!/^\S+@\S+\.\S+$/.test(v.email)) errors.email = "Enter a valid email";
  if (v.password.length < 8) errors.password = "At least 8 characters";
  const field = name => ({
    name, value: v[name],
    onChange: e => setV({ ...v, [name]: e.target.value }),
    onBlur: () => setTouched({ ...touched, [name]: true }),
    "aria-invalid": !!(touched[name] && errors[name]),
  });
  return (
    <form onSubmit={e => { e.preventDefault(); setTouched({ email: true, password: true }); }}>
      <div><input placeholder="email" {...field("email")} /> {touched.email && <small style={{ color: "#f43f5e" }}>{errors.email}</small>}</div>
      <div><input type="password" placeholder="password" {...field("password")} /> {touched.password && <small style={{ color: "#f43f5e" }}>{errors.password}</small>}</div>
      <button>Sign up</button> {Object.keys(errors).length === 0 && "✅ valid"}
    </form>
  );
}
--- task
Build an email field `<input id="email">` and a `<form>` with `<button id="submit">`. On submit (prevent reload): if the email does not contain **@** show `<p id="error">Invalid email</p>`; otherwise show `<p id="ok">Thanks!</p>` and no error.
--- starter
function App() {
  return (
    <form>
      <input id="email" />
      <button id="submit">Submit</button>
    </form>
  );
}
--- solution
function App() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const submit = e => {
    e.preventDefault();
    setStatus(email.includes("@") ? "ok" : "error");
  };
  return (
    <form onSubmit={submit}>
      <input id="email" value={email} onChange={e => setEmail(e.target.value)} />
      <button id="submit">Submit</button>
      {status === "error" && <p id="error">Invalid email</p>}
      {status === "ok" && <p id="ok">Thanks!</p>}
    </form>
  );
}
--- explain
`onSubmit` + `preventDefault()`; the result status decides which message renders.
--- check: Submitting "bob" shows the error
type('#email', 'bob'); await tick(); click('#submit'); await tick();
return text('#error') === 'Invalid email' && !$('#ok');
--- check: Submitting "bob@x.io" shows Thanks!
type('#email', 'bob@x.io'); await tick(); click('#submit'); await tick();
return text('#ok') === 'Thanks!' && !$('#error');

=== compound | intermediate | Compound Components (Tabs)
--- theory
**Compound components** share implicit state through context so consumers can compose them freely — like `<select>` and `<option>`.

```jsx
<Tabs defaultValue="a">
  <Tabs.List>
    <Tabs.Trigger value="a">Account</Tabs.Trigger>
    <Tabs.Trigger value="b">Billing</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="a">…</Tabs.Panel>
  <Tabs.Panel value="b">…</Tabs.Panel>
</Tabs>
```

The parent `Tabs` owns `active` state and provides it via context; each `Trigger`/`Panel` reads it. This is how headless UI libraries (Radix, Headless UI, Reach) are built.
--- demo
const TabsCtx = createContext(null);
function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsCtx.Provider value={{ active, setActive }}>{children}</TabsCtx.Provider>;
}
function Trigger({ value, children }) {
  const { active, setActive } = useContext(TabsCtx);
  return <button onClick={() => setActive(value)} style={{ fontWeight: active === value ? 700 : 400 }}>{children}</button>;
}
function Panel({ value, children }) {
  const { active } = useContext(TabsCtx);
  return active === value ? <div style={{ padding: 8 }}>{children}</div> : null;
}
function App() {
  return (
    <Tabs defaultValue="a">
      <Trigger value="a">Account</Trigger> <Trigger value="b">Billing</Trigger>
      <Panel value="a">Account settings…</Panel>
      <Panel value="b">Billing details…</Panel>
    </Tabs>
  );
}
--- task
Implement `Tabs`, `Tab` and `TabPanel` using context. `Tab` renders `<button className="tab">` (add class `active` when selected), `TabPanel` renders `<div className="panel">` only when its value is active. The starter App must work as is: initially **One** is visible; clicking the second tab shows **Two**.
--- starter
// Implement Tabs, Tab, TabPanel

function App() {
  return (
    <Tabs initial="1">
      <Tab value="1">First</Tab>
      <Tab value="2">Second</Tab>
      <TabPanel value="1">One</TabPanel>
      <TabPanel value="2">Two</TabPanel>
    </Tabs>
  );
}
--- solution
const TabsContext = createContext(null);

function Tabs({ initial, children }) {
  const [active, setActive] = useState(initial);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}
function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button className={active === value ? "tab active" : "tab"} onClick={() => setActive(value)}>
      {children}
    </button>
  );
}
function TabPanel({ value, children }) {
  const { active } = useContext(TabsContext);
  return active === value ? <div className="panel">{children}</div> : null;
}

function App() {
  return (
    <Tabs initial="1">
      <Tab value="1">First</Tab>
      <Tab value="2">Second</Tab>
      <TabPanel value="1">One</TabPanel>
      <TabPanel value="2">Two</TabPanel>
    </Tabs>
  );
}
--- explain
`Tabs` owns state; `Tab` and `TabPanel` never receive it as props — they read it from context.
--- check: Initially only panel "One" and first tab active
return $$('.panel').map(p => p.textContent).join() === 'One' && $$('.tab.active').map(t => t.textContent).join() === 'First';
--- check: Clicking Second shows "Two"
click($$('.tab')[1]); await tick();
return $$('.panel').map(p => p.textContent).join() === 'Two' && $$('.tab.active').map(t => t.textContent).join() === 'Second';

=== portals | advanced | Portals
--- theory
`createPortal(children, domNode)` renders children into a **different DOM node** — outside the parent's DOM hierarchy — while keeping them in the same *React* tree (context and event bubbling still work!).

```jsx
function Modal({ children, onClose }) {
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>{children}</div>
    </div>,
    document.getElementById("modal-root")
  );
}
```

Use for modals, tooltips, toasts and dropdowns that must escape `overflow: hidden` or `z-index` stacking. This sandbox has a `<div id="modal-root">` next to `#root`.
--- demo
function Modal({ onClose, children }) {
  return createPortal(
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "grid", placeItems: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", padding: 20, borderRadius: 8 }}>
        {children} <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
function App() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ overflow: "hidden", height: 60, border: "1px dashed #aaa" }}>
      <button onClick={() => setOpen(true)}>Open modal</button>
      {open && <Modal onClose={() => setOpen(false)}>I escaped overflow:hidden!</Modal>}
    </div>
  );
}
--- task
Clicking `<button id="open">` must render `<div id="dialog">Hello from a portal <button id="close">x</button></div>` **inside `#modal-root`** (not inside `#root`). `#close` removes it.
--- starter
function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button id="open" onClick={() => setOpen(true)}>Open</button>
    </div>
  );
}
--- solution
function Dialog({ onClose }) {
  return createPortal(
    <div id="dialog">Hello from a portal <button id="close" onClick={onClose}>x</button></div>,
    document.getElementById("modal-root")
  );
}
function App() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button id="open" onClick={() => setOpen(true)}>Open</button>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </div>
  );
}
--- explain
The dialog's DOM lives under `#modal-root`, yet its `onClose` closure and React state belong to `App`.
--- check: Opening renders #dialog inside #modal-root
click('#open'); await tick();
return !!$('#modal-root #dialog') && !$('#root #dialog');
--- check: Close removes it
click('#close'); await tick();
return !$('#dialog');

=== error-boundaries | advanced | Error Boundaries
--- theory
If a component throws during rendering, React unmounts the whole tree — unless an **error boundary** catches it. Error boundaries are (still) **class components** implementing `static getDerivedStateFromError` and optionally `componentDidCatch`:

```jsx
class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { logToService(error, info.componentStack); }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}
```

They do **not** catch errors in event handlers, async code (`setTimeout`, promises) or the boundary itself. Wrap independent widgets separately so one failure doesn't blank the page. (`react-error-boundary` is a popular helper library.)
--- demo
class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <p style={{ color: "#f43f5e" }}>💥 {this.state.error.message} <button onClick={() => this.setState({ error: null })}>retry</button></p>;
    return this.props.children;
  }
}
function Bomb() {
  const [boom, setBoom] = useState(false);
  if (boom) throw new Error("Widget crashed");
  return <button onClick={() => setBoom(true)}>Crash this widget</button>;
}
function App() {
  return (
    <div>
      <ErrorBoundary><Bomb /></ErrorBoundary>
      <p>The rest of the page keeps working.</p>
    </div>
  );
}
--- task
Write an `ErrorBoundary` class component. When a child throws, render `<p id="fallback">Something went wrong</p>` instead. The provided `Buggy` throws after `#crash` is clicked; `<p id="safe">` outside the boundary must remain visible.
--- starter
function Buggy() {
  const [crash, setCrash] = useState(false);
  if (crash) throw new Error("boom");
  return <button id="crash" onClick={() => setCrash(true)}>Crash</button>;
}

function App() {
  return (
    <div>
      <Buggy />
      <p id="safe">I am safe</p>
    </div>
  );
}
--- solution
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return <p id="fallback">Something went wrong</p>;
    return this.props.children;
  }
}

function Buggy() {
  const [crash, setCrash] = useState(false);
  if (crash) throw new Error("boom");
  return <button id="crash" onClick={() => setCrash(true)}>Crash</button>;
}

function App() {
  return (
    <div>
      <ErrorBoundary>
        <Buggy />
      </ErrorBoundary>
      <p id="safe">I am safe</p>
    </div>
  );
}
--- explain
`getDerivedStateFromError` flips state during the render phase, so the boundary renders the fallback instead of its crashed children.
--- check: After crash, fallback is shown and #safe survives
click('#crash'); await tick(80);
return text('#fallback') === 'Something went wrong' && text('#safe') === 'I am safe';

=== lazy-suspense | advanced | Code Splitting: lazy & Suspense
--- theory
`React.lazy` loads a component on demand; `<Suspense>` shows a **fallback** while it loads.

```jsx
const Chart = lazy(() => import("./Chart"));   // separate bundle chunk

<Suspense fallback={<Spinner />}>
  <Chart />
</Suspense>
```

`lazy` takes a function returning a Promise that resolves to a module `{ default: Component }`. Suspense boundaries can be nested to reveal UI progressively. In React 18+, Suspense also powers streaming SSR and data fetching in frameworks (Next.js, Remix).

In this sandbox there is no bundler, so simulate `import()` with a Promise.
--- demo
const Heavy = lazy(() => new Promise(res => setTimeout(() => res({ default: () => <p>📦 Heavy component loaded!</p> }), 1200)));
function App() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow(true)}>Load heavy component</button>
      {show && (
        <Suspense fallback={<p>⏳ Loading chunk…</p>}>
          <Heavy />
        </Suspense>
      )}
    </div>
  );
}
--- task
Create `const Profile = lazy(...)` that resolves after **200 ms** to a component rendering `<h2 id="profile">Profile loaded</h2>`. Render it inside `<Suspense fallback={<p id="spinner">Loading...</p>}>`.
--- starter
// const Profile = lazy(() => new Promise(...));

function App() {
  return <div></div>;
}
--- solution
const Profile = lazy(
  () => new Promise(resolve =>
    setTimeout(() => resolve({ default: () => <h2 id="profile">Profile loaded</h2> }), 200)
  )
);

function App() {
  return (
    <div>
      <Suspense fallback={<p id="spinner">Loading...</p>}>
        <Profile />
      </Suspense>
    </div>
  );
}
--- explain
While the promise is pending, `Profile` *suspends* and the nearest Suspense renders its fallback.
--- check: Fallback shown first
return text('#spinner') === 'Loading...' && !$('#profile');
--- check: Profile appears after loading
await tick(450);
return text('#profile') === 'Profile loaded' && !$('#spinner');

=== concurrent | advanced | Concurrent UI: useTransition & useDeferredValue
--- theory
React 18 can interrupt rendering. You mark some updates as **non-urgent** so typing stays responsive while a heavy list re-renders.

```jsx
// Option 1: useTransition — wrap the state update
const [isPending, startTransition] = useTransition();
onChange={e => {
  setInput(e.target.value);                     // urgent
  startTransition(() => setQuery(e.target.value)); // can lag behind
}}

// Option 2: useDeferredValue — defer a value you receive
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => filter(bigList, deferredQuery), [deferredQuery]);
const stale = query !== deferredQuery;
```

Use them for filtering large lists, tab switches with heavy content, charts. They are **not** debouncing: no fixed delay, React just prioritises urgent work.
--- demo
const all = Array.from({ length: 4000 }, (_, i) => "Item " + i);
function SlowList({ q }) {
  const items = all.filter(x => x.includes(q)).slice(0, 300);
  const t = performance.now(); while (performance.now() - t < 30) {}   // simulate slowness
  return <ul>{items.map(x => <li key={x}>{x}</li>)}</ul>;
}
function App() {
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  return (
    <div>
      <input placeholder="type quickly: 12" value={q} onChange={e => setQ(e.target.value)} />
      <span style={{ opacity: q !== dq ? 1 : 0 }}> updating…</span>
      <div style={{ opacity: q !== dq ? 0.5 : 1 }}><SlowList q={dq} /></div>
    </div>
  );
}
--- task
Use `useTransition`: typing in `<input id="q">` updates the input immediately, while the filtered `<li className="res">` list of `names` is updated inside `startTransition`. Show `<span id="pending">…</span>` only while `isPending`. After typing **an**, the list must contain only names including "an".
--- starter
const names = ["Anna", "Brian", "Diana", "Ethan", "Fiona", "Hannah", "Ivan"];

function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const results = names.filter(n => n.toLowerCase().includes(query));
  return (
    <div>
      <input id="q" value={input} onChange={e => setInput(e.target.value)} />
      <ul>{results.map(n => <li className="res" key={n}>{n}</li>)}</ul>
    </div>
  );
}
--- solution
const names = ["Anna", "Brian", "Diana", "Ethan", "Fiona", "Hannah", "Ivan"];

function App() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const results = names.filter(n => n.toLowerCase().includes(query));
  return (
    <div>
      <input
        id="q"
        value={input}
        onChange={e => {
          const v = e.target.value;
          setInput(v);
          startTransition(() => setQuery(v.toLowerCase()));
        }}
      />
      {isPending && <span id="pending">…</span>}
      <ul>{results.map(n => <li className="res" key={n}>{n}</li>)}</ul>
    </div>
  );
}
--- explain
`setInput` is urgent so the textbox never lags; `setQuery` runs in a transition that React may interrupt.
--- check: Typing "an" filters the list
type('#q', 'an'); await tick(150);
return $$('.res').map(l => l.textContent).join() === 'Anna,Brian,Diana,Ethan,Hannah,Ivan';
--- check: Input reflects typing and no pending indicator at rest
return $('#q').value === 'an' && !$('#pending');

=== use-id | advanced | useId & Accessible Forms
--- theory
`useId()` generates a **unique, stable ID** per component instance — identical on server and client, so it's safe with SSR hydration.

```jsx
function Field({ label }) {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={id + "-hint"} />
      <small id={id + "-hint"}>Required</small>
    </>
  );
}
```

Never hard-code IDs in reusable components (two instances would clash) and don't use `Math.random()` (hydration mismatch). Don't use `useId` for list keys.

Accessibility basics: every input needs a label, use semantic elements (`button`, `nav`, `main`), and make interactive things keyboard-reachable.
--- demo
function Field({ label, hint }) {
  const id = useId();
  return (
    <div style={{ marginBottom: 8 }}>
      <label htmlFor={id}>{label}</label><br />
      <input id={id} aria-describedby={id + "-hint"} />
      <div id={id + "-hint"} style={{ fontSize: 12, color: "#6B7280" }}>{hint} (id: {id})</div>
    </div>
  );
}
function App() {
  return <form><Field label="Email" hint="We never share it" /><Field label="Phone" hint="Optional" /></form>;
}
--- task
Create a reusable `LabeledInput({ label })` that renders a `<label>` connected to its `<input>` via `useId` (`htmlFor` ↔ `id`). Render it twice (labels **First** and **Last**). The two inputs must have different ids.
--- starter
function LabeledInput({ label }) {
  return (
    <div>
      <label>{label}</label>
      <input />
    </div>
  );
}

function App() {
  return (
    <div>
      <LabeledInput label="First" />
      <LabeledInput label="Last" />
    </div>
  );
}
--- solution
function LabeledInput({ label }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

function App() {
  return (
    <div>
      <LabeledInput label="First" />
      <LabeledInput label="Last" />
    </div>
  );
}
--- explain
Each instance gets its own ID, so clicking a label focuses the right input and screen readers announce it.
--- check: Each label points at its input
return $$('label').length === 2 && $$('label').every(l => l.htmlFor && document.getElementById(l.htmlFor) === l.nextElementSibling);
--- check: IDs are unique
const ids = $$('input').map(i => i.id);
return ids.length === 2 && ids[0] && ids[0] !== ids[1];

=== external-store | advanced | useSyncExternalStore
--- theory
To read data that lives **outside React** (a global store, browser APIs like `navigator.onLine`, a WebSocket cache), use `useSyncExternalStore`. It's how Redux, Zustand and others integrate safely with concurrent rendering (no "tearing").

```jsx
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: next => { state = next; listeners.forEach(l => l()); },
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
  };
}
const store = createStore(0);

function useStore() {
  return useSyncExternalStore(store.subscribe, store.get);
}
```

`getSnapshot` must return the same value (===) while the store hasn't changed, otherwise React re-renders forever.
--- demo
function useOnline() {
  return useSyncExternalStore(
    cb => { addEventListener("online", cb); addEventListener("offline", cb); return () => { removeEventListener("online", cb); removeEventListener("offline", cb); }; },
    () => navigator.onLine
  );
}
function useWindowWidth() {
  return useSyncExternalStore(cb => { addEventListener("resize", cb); return () => removeEventListener("resize", cb); }, () => innerWidth);
}
function App() {
  return <p>{useOnline() ? "🟢 Online" : "🔴 Offline"} · width {useWindowWidth()}px</p>;
}
--- task
A tiny `store` is provided. Write a hook `useCount()` with `useSyncExternalStore` and render the value in **two** components `<span className="view">`. The `#ext` button is wired to `store.increment()` (outside React state) — both views must update.
--- starter
const store = (() => {
  let count = 0;
  const listeners = new Set();
  return {
    getSnapshot: () => count,
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
    increment: () => { count++; listeners.forEach(l => l()); },
  };
})();

function View() {
  return <span className="view">?</span>;
}

function App() {
  return (
    <div>
      <View /> <View />
      <button id="ext" onClick={() => store.increment()}>increment store</button>
    </div>
  );
}
--- solution
const store = (() => {
  let count = 0;
  const listeners = new Set();
  return {
    getSnapshot: () => count,
    subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
    increment: () => { count++; listeners.forEach(l => l()); },
  };
})();

function useCount() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

function View() {
  const count = useCount();
  return <span className="view">{count}</span>;
}

function App() {
  return (
    <div>
      <View /> <View />
      <button id="ext" onClick={() => store.increment()}>increment store</button>
    </div>
  );
}
--- explain
React subscribes each View and re-reads the snapshot whenever the store notifies listeners.
--- check: Both views start at 0
return $$('.view').map(v => v.textContent).join() === '0,0';
--- check: Two increments update both views to 2
click('#ext'); click('#ext'); await tick();
return $$('.view').map(v => v.textContent).join() === '2,2';

=== imperative-handle | advanced | forwardRef & useImperativeHandle
--- theory
Sometimes a parent needs to call an imperative method on a child (focus, scroll, play video). `forwardRef` lets a component receive a `ref`; `useImperativeHandle` customises what that ref exposes — a minimal API instead of the raw DOM node.

```jsx
const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }), []);
  return <input ref={inputRef} {...props} />;
});

const r = useRef();
<FancyInput ref={r} />
r.current.focus();
```

(In React 19 `ref` is a regular prop and `forwardRef` is no longer needed.) Prefer declarative props when possible.
--- demo
const Video = forwardRef(function Video(props, ref) {
  const [t, setT] = useState(0);
  useImperativeHandle(ref, () => ({ seek: s => setT(s), reset: () => setT(0) }), []);
  return <p>▶ playing at {t}s</p>;
});
function App() {
  const v = useRef(null);
  return (
    <div>
      <Video ref={v} />
      <button onClick={() => v.current.seek(42)}>Seek 42s</button>{" "}
      <button onClick={() => v.current.reset()}>Reset</button>
    </div>
  );
}
--- task
Create `const Search = forwardRef(...)` rendering `<input id="search" defaultValue="old text">`. Expose **only** `focus()` and `clear()` via `useImperativeHandle`. In App, `#do` must call `clear()` then `focus()` on it.
--- starter
// const Search = forwardRef(function Search(props, ref) { ... });

function App() {
  return (
    <div>
      <button id="do">Clear & focus</button>
    </div>
  );
}
--- solution
const Search = forwardRef(function Search(props, ref) {
  const inputRef = useRef(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ""; },
  }), []);
  return <input id="search" ref={inputRef} defaultValue="old text" />;
});

function App() {
  const ref = useRef(null);
  return (
    <div>
      <Search ref={ref} />
      <button id="do" onClick={() => { ref.current.clear(); ref.current.focus(); }}>Clear & focus</button>
    </div>
  );
}
--- explain
The parent's `ref.current` is the object returned from `useImperativeHandle`, not the DOM input.
--- check: Clicking #do clears and focuses the input
$('#do').focus(); click('#do'); await tick();
return $('#search').value === '' && document.activeElement === $('#search');

=== hoc-render-props | advanced | HOCs & Render Props
--- theory
Two classic patterns for sharing behaviour (largely replaced by hooks, but common in interviews and older codebases):

**Higher-Order Component** — a function that takes a component and returns an enhanced one:

```jsx
function withLoading(Component) {
  return function Wrapped({ loading, ...props }) {
    return loading ? <p>Loading…</p> : <Component {...props} />;
  };
}
const UserListWithLoading = withLoading(UserList);
```

**Render props** — a component that takes a function prop and calls it with its state:

```jsx
<MouseTracker render={({ x, y }) => <p>{x}, {y}</p>} />
// or with children as a function
<Toggle>{({ on, toggle }) => <button onClick={toggle}>{on ? "ON" : "OFF"}</button>}</Toggle>
```
--- demo
function Hover({ children }) {
  const [hover, setHover] = useState(false);
  return <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{children(hover)}</div>;
}
function withBorder(Component, color) {
  return props => <div style={{ border: `2px solid ${color}`, padding: 6, margin: 4 }}><Component {...props} /></div>;
}
const Title = ({ text }) => <h3 style={{ margin: 0 }}>{text}</h3>;
const BlueTitle = withBorder(Title, "#4f46e5");
function App() {
  return (
    <div>
      <BlueTitle text="Wrapped by a HOC" />
      <Hover>{h => <p style={{ background: h ? "#99f6e4" : "#F5F7FA" }}>{h ? "Hovering!" : "Hover me (render prop)"}</p>}</Hover>
    </div>
  );
}
--- task
1. Write a HOC `withUppercase(Component)` that passes `text` upper-cased to the wrapped component. 2. Write `Toggle` that calls `children({ on, toggle })` (render prop). App already uses both — `#title` must read **HELLO HOC** and `#t` must switch **off**→**on** when clicked.
--- starter
function withUppercase(Component) {
  return Component;
}

function Toggle({ children }) {
  return null;
}

const Title = ({ text }) => <h3 id="title">{text}</h3>;
const LoudTitle = withUppercase(Title);

function App() {
  return (
    <div>
      <LoudTitle text="hello hoc" />
      <Toggle>{({ on, toggle }) => <button id="t" onClick={toggle}>{on ? "on" : "off"}</button>}</Toggle>
    </div>
  );
}
--- solution
function withUppercase(Component) {
  return function Uppercased({ text, ...rest }) {
    return <Component {...rest} text={String(text).toUpperCase()} />;
  };
}

function Toggle({ children }) {
  const [on, setOn] = useState(false);
  return children({ on, toggle: () => setOn(o => !o) });
}

const Title = ({ text }) => <h3 id="title">{text}</h3>;
const LoudTitle = withUppercase(Title);

function App() {
  return (
    <div>
      <LoudTitle text="hello hoc" />
      <Toggle>{({ on, toggle }) => <button id="t" onClick={toggle}>{on ? "on" : "off"}</button>}</Toggle>
    </div>
  );
}
--- explain
The HOC returns a new component that transforms props; the render-prop component owns state and delegates rendering to the function it receives.
--- check: HOC upper-cases the title
return text('#title') === 'HELLO HOC';
--- check: Render-prop toggle works
const a = text('#t'); click('#t'); await tick();
return a === 'off' && text('#t') === 'on';

=== state-machine | advanced | State Machines with useReducer
--- theory
Many UI bugs come from "impossible" state combinations (`isLoading && isError`). Model the component as a **finite state machine**: a status plus allowed transitions.

```jsx
const machine = {
  idle:    { FETCH: "loading" },
  loading: { RESOLVE: "success", REJECT: "error" },
  success: { FETCH: "loading" },
  error:   { RETRY: "loading" },
};
function reducer(state, event) {
  const next = machine[state.status][event.type];
  return next ? { ...state, status: next, data: event.data ?? state.data } : state; // ignore invalid events
}
```

Invalid events are simply ignored, so a double-click can't start two fetches. Libraries like **XState** take this further (guards, nested & parallel states, visualisers).
--- demo
const lights = { green: { NEXT: "yellow" }, yellow: { NEXT: "red" }, red: { NEXT: "green" } };
const colors = { green: "#14b8a6", yellow: "#f59e0b", red: "#f43f5e" };
function App() {
  const [s, send] = useReducer((st, ev) => lights[st][ev] ?? st, "green");
  return (
    <div>
      <div style={{ width: 60, height: 60, borderRadius: 30, background: colors[s] }} />
      <p>{s}</p>
      <button onClick={() => send("NEXT")}>NEXT</button>{" "}
      <button onClick={() => send("BOGUS")}>invalid event (ignored)</button>
    </div>
  );
}
--- task
Implement a door machine with states **closed**, **open**, **locked**. Events: OPEN (closed→open), CLOSE (open→closed), LOCK (closed→locked), UNLOCK (locked→closed). Invalid events are ignored. Show the state in `<p id="state">` and buttons `#OPEN`, `#CLOSE`, `#LOCK`, `#UNLOCK`. Start **closed**.
--- starter
function App() {
  const state = "closed";
  return (
    <div>
      <p id="state">{state}</p>
      {["OPEN", "CLOSE", "LOCK", "UNLOCK"].map(e => <button key={e} id={e}>{e}</button>)}
    </div>
  );
}
--- solution
const door = {
  closed: { OPEN: "open", LOCK: "locked" },
  open: { CLOSE: "closed" },
  locked: { UNLOCK: "closed" },
};

function App() {
  const [state, send] = useReducer((s, event) => door[s][event] ?? s, "closed");
  return (
    <div>
      <p id="state">{state}</p>
      {["OPEN", "CLOSE", "LOCK", "UNLOCK"].map(e => (
        <button key={e} id={e} onClick={() => send(e)}>{e}</button>
      ))}
    </div>
  );
}
--- explain
A transition table + `?? s` fallback guarantees only legal transitions happen.
--- check: LOCK then OPEN keeps it locked (invalid ignored)
click('#LOCK'); await tick(); click('#OPEN'); await tick();
return text('#state') === 'locked';
--- check: UNLOCK → OPEN → CLOSE ends closed; LOCK while open ignored
click('#UNLOCK'); await tick(); click('#OPEN'); await tick();
const opened = text('#state');
click('#LOCK'); await tick(); const still = text('#state');
click('#CLOSE'); await tick();
return opened === 'open' && still === 'open' && text('#state') === 'closed';

=== optimistic | advanced | Optimistic Updates with Rollback
--- theory
**Optimistic UI** updates the screen *before* the server confirms, then rolls back if the request fails. It makes apps feel instant.

```jsx
async function like() {
  const prev = likes;
  setLikes(l => l + 1);            // 1. optimistic
  try {
    await api.like(postId);        // 2. confirm
  } catch {
    setLikes(prev);                // 3. rollback
    toast("Could not like post");
  }
}
```

React 19 adds a dedicated `useOptimistic` hook; TanStack Query offers `onMutate`/`onError` for the same pattern. In this sandbox, `api.save(ms, fail)` returns a Promise that resolves or rejects.
--- demo
function App() {
  const [likes, setLikes] = useState(10);
  const [failNext, setFailNext] = useState(false);
  const [msg, setMsg] = useState("");
  const like = async () => {
    const prev = likes;
    setLikes(l => l + 1);
    setMsg("saving…");
    try { await api.save(700, failNext); setMsg("saved ✔"); }
    catch { setLikes(prev); setMsg("failed — rolled back ✖"); }
  };
  return (
    <div>
      <button onClick={like}>👍 {likes}</button>{" "}
      <label><input type="checkbox" checked={failNext} onChange={e => setFailNext(e.target.checked)} /> make the server fail</label>
      <p>{msg}</p>
    </div>
  );
}
--- task
`<button id="like">` shows the like count (start **5**). Clicking increments **immediately**, then calls `api.save(150, shouldFail)` where `shouldFail` is the checked state of `<input id="fail" type="checkbox">`. On failure roll the count back and show `<p id="err">Rollback</p>`.
--- starter
function App() {
  const [likes, setLikes] = useState(5);
  const [fail, setFail] = useState(false);
  return (
    <div>
      <button id="like">{likes}</button>
      <input id="fail" type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} />
    </div>
  );
}
--- solution
function App() {
  const [likes, setLikes] = useState(5);
  const [fail, setFail] = useState(false);
  const [error, setError] = useState(false);
  const like = async () => {
    const prev = likes;
    setLikes(l => l + 1);
    setError(false);
    try {
      await api.save(150, fail);
    } catch {
      setLikes(prev);
      setError(true);
    }
  };
  return (
    <div>
      <button id="like" onClick={like}>{likes}</button>
      <input id="fail" type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} />
      {error && <p id="err">Rollback</p>}
    </div>
  );
}
--- explain
Save the previous value, update optimistically, and restore it in `catch`.
--- check: Increments immediately and stays after success
click('#like'); await tick(20); const fast = text('#like'); await tick(250);
return fast === '6' && text('#like') === '6' && !$('#err');
--- check: Rolls back on failure
click('#fail'); await tick(); click('#like'); await tick(20); const opt = text('#like'); await tick(250);
return opt === '7' && text('#like') === '6' && text('#err') === 'Rollback';

=== virtualization | advanced | List Virtualization
--- theory
Rendering 10,000 DOM nodes is slow. **Virtualization** (windowing) renders only the rows visible in the viewport plus a small overscan, and fakes the full height with spacers.

```text
visibleStart = floor(scrollTop / rowHeight)
visibleCount = ceil(viewportHeight / rowHeight) + overscan
translateY   = visibleStart * rowHeight
total height = items.length * rowHeight
```

Libraries: **TanStack Virtual**, react-window, react-virtuoso. Keys must be the item id so rows recycle correctly.
--- demo
const ROW = 24, H = 200;
const data = Array.from({ length: 100000 }, (_, i) => `Row #${i}`);
function App() {
  const [top, setTop] = useState(0);
  const start = Math.floor(top / ROW);
  const visible = data.slice(start, start + Math.ceil(H / ROW) + 5);
  return (
    <div>
      <p>100,000 rows, only {visible.length} in the DOM</p>
      <div onScroll={e => setTop(e.currentTarget.scrollTop)} style={{ height: H, overflow: "auto", border: "1px solid #E2E6ED" }}>
        <div style={{ height: data.length * ROW, position: "relative" }}>
          <div style={{ transform: `translateY(${start * ROW}px)` }}>
            {visible.map((r, i) => <div key={start + i} style={{ height: ROW }}>{r}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
--- task
Render the 10,000 `items` in a scroll container `<div id="viewport">` (height **200px**, `overflow: auto`, row height **20px**). Only render visible rows (`<div className="row">`) — at most 30 rows in the DOM. Scrolling must update which rows are rendered (the first row after scrolling to 2000px is **Item 100**).
--- starter
const items = Array.from({ length: 10000 }, (_, i) => "Item " + i);

function App() {
  return (
    <div id="viewport" style={{ height: 200, overflow: "auto" }}>
      {items.map(i => <div className="row" key={i} style={{ height: 20 }}>{i}</div>)}
    </div>
  );
}
--- solution
const items = Array.from({ length: 10000 }, (_, i) => "Item " + i);
const ROW = 20, HEIGHT = 200;

function App() {
  const [scrollTop, setScrollTop] = useState(0);
  const start = Math.floor(scrollTop / ROW);
  const count = Math.ceil(HEIGHT / ROW) + 5;
  const visible = items.slice(start, start + count);
  return (
    <div id="viewport" style={{ height: HEIGHT, overflow: "auto" }} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: items.length * ROW, position: "relative" }}>
        <div style={{ position: "absolute", top: start * ROW, left: 0, right: 0 }}>
          {visible.map(i => <div className="row" key={i} style={{ height: ROW }}>{i}</div>)}
        </div>
      </div>
    </div>
  );
}
--- explain
A full-height spacer keeps the scrollbar realistic; only `count` rows are rendered at an offset of `start * ROW`.
--- check: At most 30 rows in the DOM
return $$('.row').length > 0 && $$('.row').length <= 30;
--- check: Scrolling to 2000px renders Item 100 first
const vp = $('#viewport'); vp.scrollTop = 2000; vp.dispatchEvent(new Event('scroll')); await tick(80);
return $$('.row')[0].textContent === 'Item 100';

=== keys-reconciliation | advanced | Keys & Reconciliation
--- theory
React compares the previous and next element trees (**reconciliation**). For lists it matches children by `key`. If keys are array indexes, re-ordering makes React *reuse* the DOM/state of the wrong item.

```jsx
// ❌ index keys — typed text "sticks" to the position, not the item
{items.map((it, i) => <Row key={i} item={it} />)}
// ✅ stable identity
{items.map(it => <Row key={it.id} item={it} />)}
```

Keys also let you **reset state on purpose**: `<Profile key={userId} />` gives every user a fresh component instance. Same type + same position + same key ⇒ state preserved; otherwise remounted.
--- demo
function Row({ label }) {
  return <li>{label}: <input placeholder={"note for " + label} /></li>;
}
function App() {
  const [items, setItems] = useState(["Apple", "Banana", "Cherry"]);
  return (
    <div>
      <p>Type in the Apple box, then reverse both lists.</p>
      <button onClick={() => setItems(i => [...i].reverse())}>Reverse</button>
      <div style={{ display: "flex", gap: 24 }}>
        <div><b>index keys ❌</b><ul>{items.map((it, i) => <Row key={i} label={it} />)}</ul></div>
        <div><b>stable keys ✅</b><ul>{items.map(it => <Row key={it} label={it} />)}</ul></div>
      </div>
    </div>
  );
}
--- task
Each `Row` has its own uncontrolled input. Fix the keys so that after typing **note** into the *Alpha* row and clicking `#reverse`, the input with value **note** is still in the row labelled Alpha (now last).
--- starter
const initial = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }];

function Row({ label }) {
  return <li className="row"><span>{label}</span><input /></li>;
}

function App() {
  const [rows, setRows] = useState(initial);
  return (
    <div>
      <button id="reverse" onClick={() => setRows(r => [...r].reverse())}>Reverse</button>
      <ul>{rows.map((r, i) => <Row key={i} label={r.label} />)}</ul>
    </div>
  );
}
--- solution
const initial = [{ id: "a", label: "Alpha" }, { id: "b", label: "Beta" }, { id: "c", label: "Gamma" }];

function Row({ label }) {
  return <li className="row"><span>{label}</span><input /></li>;
}

function App() {
  const [rows, setRows] = useState(initial);
  return (
    <div>
      <button id="reverse" onClick={() => setRows(r => [...r].reverse())}>Reverse</button>
      <ul>{rows.map(r => <Row key={r.id} label={r.label} />)}</ul>
    </div>
  );
}
--- explain
With `key={r.id}` React moves the existing Alpha `<li>` (and its DOM input) instead of relabelling positions.
--- check: Typed text follows the Alpha row after reversing
const alphaInput = $$('.row')[0].querySelector('input'); alphaInput.value = 'note';
click('#reverse'); await tick();
const last = $$('.row')[2];
return last.querySelector('span').textContent === 'Alpha' && last.querySelector('input').value === 'note';
