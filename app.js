(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);

  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];

  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    { id: "PR-06", type: "HDMI projector", model: "Epson EB-X49", bin: "Workshop", repair: true },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    { id: "AD-12", type: "USB-C → HDMI adapter", model: "Belkin AVC002", bin: "C4" },
    { id: "AD-15", type: "USB-C → HDMI adapter", model: "Anker A8312", bin: "C4" },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];

  const people = ["Isha Rao", "Kabir Sen", "Leela Das", "Tara Shah", "Dev Menon"];

  const shifts = [
    {
      time: "Friday · 3:45 pm",
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];

  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];

  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      { num: 401, req: "RQ-209", asset: "MI-09", who: "Tara Shah", due: "Sat 10 am", back: false },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });

  let s = original();

  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );

  const btn = (label, act, val = "", style = "") =>
    `<button class="btn ${style}" data-action="${act}" data-val="${esc(val)}">${esc(label)}</button>`;

  const badge = (t, good = false) =>
    `<span class="badge${good ? " good" : ""}">${esc(t)}</span>`;

  const head = (title, sub, control = "") =>
    `<h2>${esc(title)}</h2><p class="sub">${esc(sub)}</p>${control}`;

  const row = (label, sub, right = "") =>
    `<div class="row"><div><div class="label">${esc(label)}</div><div class="sub">${esc(sub)}</div></div><div>${right}</div></div>`;

  // Groups open (not yet returned) slips by their approved request so the
  // counter can see, per event, exactly which units are still out.
  function outstandingByRequest() {
    const groups = [];
    for (const l of s.loans) {
      if (l.back) continue;
      let g = groups.find((x) => x.req === l.req);
      if (!g) {
        g = { req: l.req, slips: [] };
        groups.push(g);
      }
      g.slips.push(l);
    }
    return groups;
  }

  function requestPage() {
    let html = head("Approved requests", "Student Activities Office · 3 approved forms");
    if (s.selected) {
      const r = getReq(s.selected);
      const open = s.loans.filter((l) => l.req === r.id && !l.back);
      const back = s.loans.filter((l) => l.req === r.id && l.back);
      html +=
        btn("Back to list", "close") +
        `<div class="request-detail">
          <p class="sub">${esc(r.id)} · Approved</p>
          <h3>${esc(r.event)}</h3>
          <p class="meta">${esc(r.club)} · Filed by ${esc(r.owner)} · Return by ${esc(r.due)}</p>
          <h3>Approved equipment</h3>
          <ul>${r.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
          <p class="meta">${esc(r.note)}</p>
          <h3>Loan status</h3>
          ${open.length
            ? open
                .map((l) =>
                  row(
                    "L-" + l.num + " · " + getAsset(l.asset).type,
                    getAsset(l.asset).id + " · Issued to " + l.who,
                    badge("Still out"),
                  ),
                )
                .join("")
            : `<p class="sub">Nothing on loan for this request.</p>`}
          ${back.length
            ? back
                .map((l) =>
                  row(
                    "L-" + l.num + " · " + getAsset(l.asset).type,
                    getAsset(l.asset).id + " · " + (l.returnedBy ? "Returned by " + esc(l.returnedBy) : "Returned"),
                    badge("Returned", true),
                  ),
                )
                .join("")
            : ""}
        </div>`;
    } else {
      html += requests
        .map((r) => {
          const open = s.loans.filter((l) => l.req === r.id && !l.back).length;
          const status = open
            ? badge(open + (open === 1 ? " unit still out" : " units still out"))
            : "";
          return row(r.event, `${r.id} · ${r.club} · Due ${r.due}`, status + btn("View form", "request", r.id));
        })
        .join("");
    }
    return html;
  }

  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
      `<select class="select" data-filter>
        ${["All items", "On shelf", "On loan", "In repair"]
          .map((v) => `<option${v === s.filter ? " selected" : ""}>${v}</option>`)
          .join("")}
      </select>`,
    );
    for (const a of assets) {
      const status = a.repair ? "In repair" : out(a.id) ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(`${a.id} · ${a.type}`, `${a.model} · Bin ${a.bin}`, badge(status, status === "On shelf"));
    }
    return html;
  }

  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing ? btn("Cancel", "cancel") : btn("New issue slip", "new", "", "btn-primary"),
    );

    const groups = outstandingByRequest();
    if (groups.length) {
      html += `<p class="section-label">Still out, by request</p>`;
      for (const g of groups) {
        const r = getReq(g.req);
        html += row(
          `${r.id} · ${r.event}`,
          `${r.club} · Due ${r.due} · ` +
            g.slips.map((l) => `${getAsset(l.asset).id} (${getAsset(l.asset).type})`).join(", "),
          badge(`${g.slips.length} out`),
        );
      }
    } else {
      html += `<p class="sub">Every issued unit is back on the shelf.</p>`;
    }

    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      const sel = (label, key, options, placeholder) =>
        `<label class="issue-field">${esc(label)}
          <select class="select" name="${key}" required>
            <option value="" selected disabled>${esc(placeholder)}</option>
            ${options.map((o) => `<option value="${esc(o[0])}">${esc(o[1])}</option>`).join("")}
          </select>
        </label>`;
      html += `<form class="issue-form" data-issue>
        ${sel("Approved request", "req", requests.map((r) => [r.id, `${r.id} · ${r.event}`]), "Select request…")}
        ${sel("Unit", "asset", available.map((a) => [a.id, `${a.id} · ${a.type} (${a.model})`]), "Select unit…")}
        ${sel("Issued to", "who", people.map((p) => [p, p]), "Select person…")}
        ${sel("Due back", "due", [
          ["Fri 8 pm", "Fri 8 pm"],
          ["Sat 10 am", "Sat 10 am"],
          ["Sat noon", "Sat noon"],
        ], "Select due time…")}
        <div>${btn("Issue unit", "submit-issue", "", "btn-primary")}</div>
      </form>`;
    }

    html += `<p class="section-label">Slips</p>`;
    const shown = s.loans.filter((l) => !s.onlyOpen || !l.back).slice().reverse();
    if (!shown.length) html += `<p class="sub">No outstanding slips.</p>`;
    for (const l of shown)
      html += row(
        `L-${l.num} · ${getAsset(l.asset).type}`,
        `${l.req} · ${l.who} · Due ${l.due}`,
        l.back ? badge("Returned", true) : btn("Record return", "return", String(l.num)),
      );
    html += `<div style="margin-top:10px">
      ${btn(s.onlyOpen ? "Show all slips" : "Show outstanding only", "scope", s.onlyOpen ? "all" : "open")}
    </div>`;
    return html;
  }

  function deskbook() {
    let html = head("Desk book", "Messages from clubs and notes for the next shift");
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes) entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html += `<div class="row"><div><div class="sub">${esc(t)}</div><div class="label">${esc(author)}</div><div>${esc(body)}</div></div></div>`;
    html += `<form class="note-form" data-note>
      <input type="text" name="note" placeholder="Leave a note for the next shift…" />
      ${btn("Save note", "submit-note")}
    </form>`;
    return html;
  }

  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };

  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n]) =>
          `<button class="tab${s.tab === n ? " active" : ""}" data-action="tab" data-val="${esc(n)}">${esc(n)}</button>`,
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }

  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent += " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }

  root.addEventListener("click", (e) => {
    if (e.target.matches("[data-brief-toggle]")) {
      const body = q("[data-brief]");
      const open = body.hidden;
      body.hidden = !open;
      e.target.setAttribute("aria-expanded", String(open));
      return;
    }
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v !== "all";
        break;
      case "submit-issue":
      case "submit-note":
        // These buttons submit their form: the submit listener below owns the
        // handling. Returning without commit() avoids repainting the DOM and
        // destroying the form before the submit event fires.
        return;
      case "return": {
        const l = s.loans.find((x) => x.num === Number(v));
        if (!l || l.back) return;
        l.back = true;
        const r = getReq(l.req);
        const stillOut = s.loans.filter((x) => x.req === l.req && !x.back);
        s.notice = stillOut.length
          ? `${l.asset} returned. ${r.id} still has ${stillOut.length} unit out: ${stillOut
              .map((x) => x.asset)
              .join(", ")}.`
          : `${l.asset} returned. That closes every outstanding slip for ${r.id} — ${r.event} is fully back.`;
        break;
      }
    }
    commit();
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) => String(form.get(k)));
    const unit = getAsset(asset);
    const r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who)) return;
    if (!r.items.includes(unit.type)) {
      s.notice = "This equipment type is outside the approved request. Choose an approved unit.";
      commit();
      return;
    }
    if (s.loans.some((l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type)) {
      s.notice = "The approved quantity of this equipment type is already on loan.";
      commit();
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit(`Issued ${asset} to ${who} on slip L-${num}.`);
  });

  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every((n) => n && shifts[n.phase] && typeof n.text === "string") ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every((l) => l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num))
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }

  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
