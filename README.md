# Campus Stores — candidate submission

Fork of the Virinchi Healthcare Product Engineer work sample. The starting app is
unchanged in scope: a fictional campus media equipment desk worked across three
phases (Friday pickup, Friday partial return, Saturday morning handover).

## What the product already handles well

The **approved-request guard on issuing**. When you open "New issue slip" during
the Friday 3:45 pm pickup, the app will not issue a unit whose type is outside
the approved request, and it will not issue a second unit of the same type once
the approved quantity is out. During Kabir's pickup, this makes it impossible to
hand over the wrong kit or over-issue against the Student Activities Office form —
the policy is enforced by the tool, not by the desk worker's memory. That is the
moment I would keep.

## The moment I would change

**Working out what is still out at a partial return.** At Friday 7:30 pm, Kabir
returns the projector and speaker but keeps the adapter, and the app just says
"returned to stock". The worker (and the Saturday morning shift that inherits the
desk) has to open the loan register, mentally group the open slips by request,
and remember that the adapter belongs to RQ-214. In my playthrough that is the
step where a handover note is doing work the product should do.

## The prototype change

Two additions to the Loan register and Requests pages:

1. **"Still out, by request"** — a summary at the top of the loan register that
   groups every open slip by its approved request, showing the event, the club,
   the due time, and the exact unit IDs outstanding. The Saturday shift sees
   "RQ-214 · Courtyard screening · Due Fri 8 pm · AD-12 (USB-C → HDMI adapter)"
   without reconstructing it.
2. **Return confirmations that close the loop** — recording a return now says
   what remains: returning the speaker answers "RQ-214 still has 1 unit out:
   AD-12", and returning the final unit says the request is fully back. The
   Requests page also shows per-request outstanding counts.

Walking the same job through the change: Kabir's partial return at 7:30 pm
immediately shows one unit still out under RQ-214; the morning shift opens the
register and sees the adapter by name before Leela reaches the counter.

**What I would keep:** the request guard above, and the localStorage shift
persistence — the desk should survive a refresh mid-shift.

**One observation at a real counter that would tell me it helped:** count how
often the incoming shift asks the outgoing shift or the note log "what's still
out from last night?" before touching the register. If the prototype works,
that question gets answered by the screen itself and the handover note volume
drops.

## Run it

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

## Submit your work

https://github.com/goyalAnushka2863/campus-stores/commit/COMMIT-SHA
