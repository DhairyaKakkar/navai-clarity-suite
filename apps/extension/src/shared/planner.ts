// NavAI — Planner (Heuristic + LLM)

import type { PageData, PageElement, GuidanceStep, SessionState, LLMConfig, ActionType } from './types';

// ── Keywords ────────────────────────────────────────────────────

const STOP_WORDS = new Set(['a','an','the','for','to','of','in','on','and','or','is','my','i','it','this','that','do','you','your','me','can','will','how']);

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// ── CTA / Penalty / Login words ─────────────────────────────────

const CTA = ['apply','start','next','continue','submit','search','book','confirm','proceed','sign in','log in','register','enroll','flight','hotel','add','create','send','save','checkout','buy','order','pay','begin','get started','go','enter','open'];
const PROGRESS = ['next','continue','proceed','submit','confirm','done','finish','complete','save','send','apply'];
const PENALTY = ['logout','log out','sign out','cancel','back','close','skip','no thanks','maybe later','dismiss','advertisement','ad','cookie','privacy','terms','unsubscribe','decline','reject'];
const LOGIN_WORDS = ['sign in','log in','login','signin','email','username','password'];
const SUCCESS_WORDS = ['success','thank you','thanks','congratulations','confirmed','complete','submitted','done','receipt','order placed','booking confirmed','payment received'];

// ── Page phase detection ────────────────────────────────────────

type PagePhase = 'login' | 'form-fill' | 'navigation' | 'submit-ready' | 'success';

function detectPhase(page: PageData): PagePhase {
  const pageLower = (page.title + ' ' + page.url).toLowerCase();

  // Check for success/completion page
  for (const w of SUCCESS_WORDS) {
    if (pageLower.includes(w)) return 'success';
  }
  // Also check visible element text for success signals
  const visibleText = page.elements.slice(0, 20).map(e => e.text.toLowerCase()).join(' ');
  for (const w of SUCCESS_WORDS) {
    if (visibleText.includes(w)) return 'success';
  }

  // Check for login form
  const hasEmailInput = page.elements.some(e => e.isInput && ['email', 'username'].some(t => (e.inputType ?? '').includes(t) || (e.placeholder ?? '').toLowerCase().includes(t) || e.label.toLowerCase().includes(t)));
  const hasPasswordInput = page.elements.some(e => e.isInput && (e.inputType === 'password' || (e.placeholder ?? '').toLowerCase().includes('password')));
  if (hasEmailInput && hasPasswordInput) return 'login';

  // Check for empty form fields
  const emptyInputs = page.elements.filter(e => e.isInput && !e.isFilled && e.inputType !== 'hidden' && e.inputType !== 'submit' && e.inputType !== 'button');
  const filledInputs = page.elements.filter(e => e.isInput && e.isFilled);

  if (emptyInputs.length > 0) return 'form-fill';
  if (filledInputs.length > 0) return 'submit-ready';

  return 'navigation';
}

// ── Heuristic scorer ────────────────────────────────────────────

function score(
  el: PageElement,
  keywords: string[],
  usedSelectors: Set<string>,
  usedTexts: string[],
  phase: PagePhase,
  hasOpenDialog: boolean,
): number {
  let s = 0;
  const txt = el.text.toLowerCase();
  const lbl = el.label.toLowerCase();
  const ph = (el.placeholder ?? '').toLowerCase();
  const combined = txt + ' ' + lbl + ' ' + ph;

  // Already used? Big penalty
  if (usedSelectors.has(el.selector)) return -1000;
  if (el.text.length > 3 && usedTexts.some(t => t.length > 3 && t.includes(el.text.substring(0, 20)))) s -= 50;

  // Dialog scope: only score dialog elements when dialog is open
  if (hasOpenDialog) {
    if (el.isInDialog) {
      s += 30;
    } else {
      return -2000;
    }
  }

  // Viewport bonus
  if (el.isInViewport) s += 5;

  // ── Phase-specific scoring ──

  if (phase === 'login') {
    // In login phase, prioritize email → password → sign-in button
    if (el.isInput && !el.isFilled) {
      if (el.inputType === 'email' || ph.includes('email') || lbl.includes('email') || ph.includes('username') || lbl.includes('username')) {
        s += 40; // Highest priority: empty email field
      } else if (el.inputType === 'password' || ph.includes('password') || lbl.includes('password')) {
        s += 35; // Next: password field
      }
    }
    for (const w of LOGIN_WORDS) {
      if (combined.includes(w)) s += 15;
    }
    // Submit/sign-in button only after fields are filled
    if (!el.isInput && el.isFilled === undefined) {
      for (const w of LOGIN_WORDS) {
        if (combined.includes(w)) s += 10;
      }
    }
  }

  if (phase === 'form-fill') {
    // Prioritize empty inputs
    if (el.isInput && !el.isFilled) {
      s += 25; // Big bonus for empty fields
      if (el.isRequired) s += 10; // Extra for required
      // Keyword match on input labels/placeholders
      for (const k of keywords) {
        if (lbl.includes(k) || ph.includes(k)) s += 15;
      }
    }
    // Filled inputs: don't suggest
    if (el.isInput && el.isFilled) s -= 30;
  }

  if (phase === 'submit-ready') {
    // Prioritize submit/continue buttons
    for (const w of PROGRESS) {
      if (combined.includes(w)) s += 25;
    }
    // Don't re-suggest inputs that are filled
    if (el.isInput && el.isFilled) s -= 30;
  }

  if (phase === 'navigation') {
    // Prioritize links and buttons matching keywords
    for (const k of keywords) {
      if (txt.includes(k)) s += 20;
      if (lbl.includes(k)) s += 15;
    }
    // CTA bonus
    for (const c of CTA) {
      if (combined.includes(c)) s += 8;
    }
  }

  // ── General scoring (all phases) ──

  // Keyword match
  for (const k of keywords) {
    if (txt.includes(k)) s += 12;
    if (lbl.includes(k)) s += 10;
    if (ph.includes(k)) s += 8;
  }

  // CTA bonus (general)
  for (const c of CTA) {
    if (txt.includes(c)) s += 5;
  }

  // Penalty words
  for (const p of PENALTY) {
    if (combined.includes(p)) s -= 25;
  }

  // Element type bonuses
  if (el.tag === 'button' || el.role === 'button') s += 3;
  if (el.tag === 'a') s += 1;
  if (el.isInput && !el.isFilled) s += 2;

  // Size bonus (larger = more prominent)
  if (el.rect.width > 100 && el.rect.height > 30) s += 2;

  // Position bonus (higher on page, within reason)
  if (el.rect.top < 600) s += 1;

  return s;
}

function actionFor(el: PageElement): ActionType {
  if (el.isInput) {
    const t = (el.inputType ?? 'text').toLowerCase();
    if (['checkbox', 'radio', 'submit', 'button', 'file'].includes(t)) return 'click';
    if (el.tag === 'select') return 'select';
    return 'type';
  }
  if (el.tag === 'select') return 'select';
  return 'click';
}

function instructionFor(el: PageElement, action: ActionType, phase: PagePhase): string {
  const name = el.label || el.text.substring(0, 50) || el.placeholder || 'this element';

  if (phase === 'login') {
    if (el.inputType === 'email' || (el.placeholder ?? '').toLowerCase().includes('email')) {
      return 'Enter your email address';
    }
    if (el.inputType === 'password') {
      return 'Enter your password';
    }
    if (action === 'click') {
      return `Click "${name}" to sign in`;
    }
  }

  if (action === 'click') return `Click "${name}"`;
  if (action === 'type') return `Enter your ${el.label || el.placeholder || 'information'}`;
  if (action === 'select') return `Select an option from "${name}"`;
  return `Interact with "${name}"`;
}

// ── Heuristic Planner ───────────────────────────────────────────

export function heuristicPlan(page: PageData, state: SessionState): GuidanceStep | null {
  if (page.elements.length === 0) return null;

  const phase = detectPhase(page);

  // If we detect a success page, signal completion
  if (phase === 'success' && state.step > 1) {
    return null; // background.ts will check for this and mark completed
  }

  const kw = tokenize(state.goal);
  const usedSelectors = new Set(state.history.map(h => h.selector));
  const usedTexts = state.history.map(h => h.text).filter(t => t.length > 3);

  // Score and rank
  const ranked = page.elements
    .map(el => ({ el, score: score(el, kw, usedSelectors, usedTexts, phase, page.hasOpenDialog) }))
    .filter(x => x.score > -500)
    .sort((a, b) => b.score - a.score);

  // Use the best element if it has any positive score
  if (ranked.length > 0 && ranked[0].score > 0) {
    const best = ranked[0].el;
    const action = actionFor(best);
    return {
      stepNumber: state.step,
      action,
      selector: best.selector,
      textHint: best.text.substring(0, 60),
      instruction: instructionFor(best, action, phase),
    };
  }

  // Fallback: pick the first visible empty input, or the first visible CTA button
  const fallbackInput = page.elements.find(e => e.isInput && !e.isFilled && e.isInViewport && !usedSelectors.has(e.selector));
  if (fallbackInput) {
    const action = actionFor(fallbackInput);
    return {
      stepNumber: state.step,
      action,
      selector: fallbackInput.selector,
      textHint: fallbackInput.text.substring(0, 60),
      instruction: instructionFor(fallbackInput, action, phase),
    };
  }

  const fallbackButton = page.elements.find(e =>
    !e.isInput && e.isInViewport && !usedSelectors.has(e.selector) &&
    (e.tag === 'button' || e.role === 'button' || e.tag === 'a')
  );
  if (fallbackButton) {
    const action: ActionType = 'click';
    return {
      stepNumber: state.step,
      action,
      selector: fallbackButton.selector,
      textHint: fallbackButton.text.substring(0, 60),
      instruction: instructionFor(fallbackButton, action, phase),
    };
  }

  return null;
}

// Check if a page looks like a success/completion page
export function isSuccessPage(page: PageData): boolean {
  return detectPhase(page) === 'success';
}

// ═════════════════════════════════════════════════════════════════
// LLM Planner
// ═════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are NavAI, a browser navigation assistant that helps users accomplish tasks step-by-step.

You will receive:
1. The user's goal
2. The current page URL and title
3. Whether a dialog/modal is currently open
4. A numbered list of interactive elements on the page (with their current values if filled)
5. Previous actions already taken

Your job: Pick the SINGLE best next action to make progress toward the goal.

Available actions:
- click(id) — Click on element with given ID
- type(id) — Focus on input element with given ID (user will type)
- select(id) — Focus on dropdown with given ID (user will select)
- wait() — No clear action available, wait

IMPORTANT RULES:
- Pick exactly ONE action per response
- Use the element ID number from the list
- NEVER repeat an action on the same element from "Previous actions"
- If a dialog/modal is open, you MUST pick an element marked [DIALOG]
- Prefer filling empty inputs before clicking submit buttons
- If the page looks like a login form and the user needs to sign in first, guide them through login
- If the goal seems complete or you're stuck, use wait()

Response format:
<Thought>Brief reasoning about what to do next</Thought>
<Action>click(5)</Action>`;

export async function llmPlan(
  page: PageData,
  state: SessionState,
  config: LLMConfig
): Promise<GuidanceStep | null> {
  const elementList = page.elements.slice(0, 50).map(el => {
    const parts = [`[${el.idx}]`];

    const flags: string[] = [];
    if (el.isInDialog) flags.push('DIALOG');
    if (!el.isInViewport) flags.push('OFFSCREEN');
    if (el.isFilled) flags.push('FILLED');
    if (el.isRequired) flags.push('REQUIRED');
    if (flags.length) parts.push(`[${flags.join(',')}]`);

    parts.push(el.tag);
    if (el.role !== el.tag) parts.push(`role="${el.role}"`);
    if (el.text) parts.push(`"${el.text.substring(0, 60)}"`);
    if (el.label) parts.push(`label="${el.label}"`);
    if (el.placeholder) parts.push(`placeholder="${el.placeholder}"`);
    if (el.isInput) parts.push(`(input:${el.inputType || 'text'})`);
    if (el.value) parts.push(`value="${el.value.substring(0, 30)}"`);
    return parts.join(' ');
  }).join('\n');

  const prevActions = state.history.length > 0
    ? state.history.slice(-8).map(h =>
        `Step ${h.step}: ${h.action} on "${h.text}" [${h.selector}]`
      ).join('\n')
    : '(none yet)';

  const dialogNote = page.hasOpenDialog
    ? '\n!! A DIALOG/MODAL IS OPEN. You MUST pick an element marked [DIALOG].'
    : '';

  const userPrompt = `Goal: ${state.goal}

Current URL: ${page.url}
Page title: ${page.title}${dialogNote}

Previous actions (${state.history.length} total):
${prevActions}

Interactive elements on page (${page.elements.length} total):
${elementList}

What is the single best next action?`;

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: string;
    const url = config.endpoint;

    if (config.provider === 'openai') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        temperature: 0,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        stop: ['</Action>'],
      });
    } else if (config.provider === 'anthropic') {
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({
        model: config.model || 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
        stop_sequences: ['</Action>'],
      });
    } else {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = JSON.stringify({
        model: config.model,
        temperature: 0,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });
    }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);

    const res = await fetch(url, { method: 'POST', headers, body, signal: ctrl.signal });
    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[NavAI] LLM error:', res.status, errText.substring(0, 200));
      return null;
    }

    const json = await res.json();
    let raw: string;

    if (config.provider === 'anthropic') {
      raw = (json.content?.[0]?.text ?? '') + '</Action>';
    } else {
      raw = (json.choices?.[0]?.message?.content ?? '') + '</Action>';
    }

    console.log('[NavAI] LLM response:', raw);

    const actionMatch = raw.match(/<Action>(\w+)\((\d+)?\)<\/Action>/i);
    if (!actionMatch) {
      console.log('[NavAI] Could not parse action from response');
      return null;
    }

    const actionName = actionMatch[1].toLowerCase();
    const elementId = actionMatch[2] ? parseInt(actionMatch[2], 10) : -1;

    if (actionName === 'wait' || elementId < 0) return null;

    const el = page.elements.find(e => e.idx === elementId);
    if (!el) {
      console.log('[NavAI] Element not found:', elementId);
      return null;
    }

    const thoughtMatch = raw.match(/<Thought>(.*?)<\/Thought>/is);
    const thought = thoughtMatch ? thoughtMatch[1].trim() : '';

    let action: ActionType = 'click';
    if (actionName === 'type') action = 'type';
    if (actionName === 'select') action = 'select';

    const phase = detectPhase(page);

    return {
      stepNumber: state.step,
      action,
      selector: el.selector,
      textHint: el.text.substring(0, 60),
      instruction: thought || instructionFor(el, action, phase),
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log('[NavAI] LLM request timed out');
    } else {
      console.error('[NavAI] LLM error:', err.message);
    }
    return null;
  }
}
