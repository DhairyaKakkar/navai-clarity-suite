// NavAI — Content Script

import type { Message, PageData, PageElement, GuidanceStep } from './shared/types';

const log = (...a: unknown[]) => console.debug('[NavAI]', ...a);

// ═════════════════════════════════════════════════════════════════
// DOM EXTRACTION
// ═════════════════════════════════════════════════════════════════

const INTERACTIVE_SELECTOR = [
  'a[href]', 'button', 'input', 'textarea', 'select', 'summary',
  '[role="button"]', '[role="link"]', '[role="tab"]', '[role="menuitem"]',
  '[role="option"]', '[role="checkbox"]', '[role="radio"]', '[role="switch"]',
  '[role="treeitem"]', '[role="combobox"]', '[role="searchbox"]',
  '[role="slider"]', '[role="spinbutton"]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

function isVisible(el: HTMLElement): boolean {
  let cur: HTMLElement | null = el;
  while (cur && cur !== document.documentElement) {
    const style = getComputedStyle(cur);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    cur = cur.parentElement as HTMLElement | null;
  }
  return true;
}

function isInViewport(rect: DOMRect): boolean {
  return rect.bottom > 0 && rect.top < window.innerHeight &&
         rect.right > 0 && rect.left < window.innerWidth;
}

function findActivePanel(): HTMLElement | null {
  const dialog = document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]') as HTMLElement | null;
  if (dialog && dialog.getBoundingClientRect().width > 50) return dialog;

  const active = document.activeElement as HTMLElement | null;
  if (!active || active === document.body || active === document.documentElement) return null;

  let bestPanel: HTMLElement | null = null;
  let cur: HTMLElement | null = active.parentElement as HTMLElement | null;
  let depth = 0;

  while (cur && cur !== document.body && depth < 15) {
    const inputs = cur.querySelectorAll('input, textarea, [contenteditable="true"], select');
    const buttons = cur.querySelectorAll('button, [role="button"], a[href]');
    const total = inputs.length + buttons.length;

    if (inputs.length >= 1 && buttons.length >= 1 && total >= 3) {
      bestPanel = cur;
      const rect = cur.getBoundingClientRect();
      const pageArea = window.innerWidth * window.innerHeight;
      if (rect.width * rect.height < pageArea * 0.8) break;
    }
    cur = cur.parentElement as HTMLElement | null;
    depth++;
  }

  return bestPanel;
}

function buildSelector(el: HTMLElement): string {
  if (el.id) return `#${CSS.escape(el.id)}`;

  const testId = el.getAttribute('data-testid');
  if (testId) return `[data-testid="${CSS.escape(testId)}"]`;

  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return `[aria-label="${CSS.escape(ariaLabel)}"]`;

  const name = el.getAttribute('name');
  if (name) return `[name="${CSS.escape(name)}"]`;

  // Path-based selector as fallback
  const path: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.documentElement && path.length < 5) {
    let seg = cur.tagName.toLowerCase();
    if (cur.id) {
      path.unshift(`#${CSS.escape(cur.id)}`);
      break;
    }
    const parent: Element | null = cur.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((c: Element) => c.tagName === cur!.tagName);
      if (siblings.length > 1) {
        seg += `:nth-of-type(${siblings.indexOf(cur) + 1})`;
      }
    }
    path.unshift(seg);
    cur = parent;
  }
  return path.join(' > ');
}

function getElementText(el: HTMLElement): string {
  let text = '';
  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent ?? '';
    }
  }
  text = text.trim().replace(/\s+/g, ' ');
  if (!text) text = (el.textContent ?? '').trim().replace(/\s+/g, ' ');
  return text.substring(0, 100);
}

function getLabel(el: HTMLElement): string {
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  const ariaLabelledBy = el.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelEl = document.getElementById(ariaLabelledBy);
    if (labelEl) return (labelEl.textContent ?? '').trim().substring(0, 80);
  }

  if (el.id) {
    const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (labelEl) return (labelEl.textContent ?? '').trim().substring(0, 80);
  }

  const parentLabel = el.closest('label');
  if (parentLabel) return (parentLabel.textContent ?? '').trim().substring(0, 80);

  const title = el.getAttribute('title');
  if (title) return title;

  return '';
}

function getInputValue(el: HTMLElement): string {
  if (el instanceof HTMLInputElement) return el.value;
  if (el instanceof HTMLTextAreaElement) return el.value;
  if (el instanceof HTMLSelectElement) return el.value;
  if (el.getAttribute('contenteditable') === 'true') return (el.textContent ?? '').trim();
  return '';
}

function isInputFilled(el: HTMLElement): boolean {
  const val = getInputValue(el);
  if (val.length > 0) return true;
  // Checkboxes/radios: check if checked
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    return el.checked;
  }
  return false;
}

function isRequired(el: HTMLElement): boolean {
  if (el.hasAttribute('required')) return true;
  if (el.getAttribute('aria-required') === 'true') return true;
  // Check if label contains asterisk
  const label = getLabel(el);
  if (label.includes('*')) return true;
  return false;
}

function extractPage(): PageData {
  const activePanel = findActivePanel();
  const hasOpenDialog = activePanel !== null;

  log(`Active panel: ${hasOpenDialog ? activePanel!.tagName + '.' + (activePanel!.className || '').substring(0, 30) : 'none'}`);

  const searchRoot = hasOpenDialog ? activePanel! : document;
  const nodes = searchRoot.querySelectorAll(INTERACTIVE_SELECTOR);
  const seen = new Set<Element>();
  const rawElements: Array<{
    el: HTMLElement;
    rect: DOMRect;
    inViewport: boolean;
    inPanel: boolean;
  }> = [];

  for (const node of nodes) {
    const el = node as HTMLElement;
    if (seen.has(el)) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width < 5 || rect.height < 5) continue;
    if (!isVisible(el)) continue;

    const parentInteractive = el.parentElement?.closest(INTERACTIVE_SELECTOR);
    if (parentInteractive && seen.has(parentInteractive)) {
      seen.delete(parentInteractive);
    }
    seen.add(el);

    if (rect.top > window.innerHeight * 3) continue;

    const inViewport = isInViewport(rect);
    const inPanel = hasOpenDialog ? activePanel!.contains(el) : false;

    rawElements.push({ el, rect, inViewport, inPanel });
  }

  rawElements.sort((a, b) => {
    if (hasOpenDialog) {
      if (a.inPanel !== b.inPanel) return a.inPanel ? -1 : 1;
    }
    if (a.inViewport !== b.inViewport) return a.inViewport ? -1 : 1;
    return a.rect.top - b.rect.top;
  });

  const capped = rawElements.slice(0, 150);

  const elements: PageElement[] = capped.map((item, idx) => {
    const { el, rect, inViewport, inPanel } = item;
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role') ?? tag;
    const isInputEl = ['input', 'textarea', 'select'].includes(tag) || el.getAttribute('contenteditable') === 'true';

    return {
      idx,
      tag,
      role,
      text: getElementText(el),
      label: getLabel(el),
      selector: buildSelector(el),
      rect: {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      },
      isInput: isInputEl,
      inputType: el.getAttribute('type') ?? undefined,
      placeholder: el.getAttribute('placeholder') ?? undefined,
      value: isInputEl ? getInputValue(el) : undefined,
      isRequired: isInputEl ? isRequired(el) : undefined,
      isFilled: isInputEl ? isInputFilled(el) : undefined,
      isInViewport: inViewport,
      isInDialog: inPanel,
    };
  });

  return {
    url: location.href,
    title: document.title,
    elements,
    hasOpenDialog,
  };
}

// ═════════════════════════════════════════════════════════════════
// OVERLAY
// ═════════════════════════════════════════════════════════════════

let overlayHost: HTMLDivElement | null = null;
let shadow: ShadowRoot | null = null;
let currentStep: GuidanceStep | null = null;
let actionCleanup: (() => void) | null = null;
let repositionInterval: ReturnType<typeof setInterval> | null = null;
let currentTarget: Element | null = null;

function getOverlay(): ShadowRoot {
  if (shadow) return shadow;

  overlayHost = document.createElement('div');
  overlayHost.id = 'navai-overlay';
  Object.assign(overlayHost.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });
  document.documentElement.appendChild(overlayHost);
  shadow = overlayHost.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    .highlight {
      position: fixed;
      border: 3px solid #1d4ed8;
      border-radius: 6px;
      box-shadow: 0 0 0 4000px rgba(0,0,0,0.35);
      pointer-events: none;
      transition: top 0.15s, left 0.15s, width 0.15s, height 0.15s;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.35), 0 0 0 0 rgba(29,78,216,0.4); }
      50% { box-shadow: 0 0 0 4000px rgba(0,0,0,0.35), 0 0 15px 5px rgba(29,78,216,0.3); }
    }
    .card {
      position: fixed;
      background: #fff;
      border: 2px solid #1d4ed8;
      border-radius: 12px;
      padding: 12px 16px;
      max-width: 280px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-family: system-ui, sans-serif;
      pointer-events: auto;
      z-index: 2147483647;
      transition: top 0.15s, left 0.15s;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }
    .badge {
      font-size: 9px;
      font-weight: 700;
      color: #fff;
      background: #1d4ed8;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .step-num {
      font-size: 11px;
      font-weight: 700;
      color: #1d4ed8;
      text-transform: uppercase;
    }
    .instruction {
      font-size: 14px;
      color: #1e1e2e;
      line-height: 1.4;
      margin-bottom: 8px;
    }
    .done-btn {
      font-size: 12px;
      padding: 6px 14px;
      background: #1d4ed8;
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    .done-btn:hover { background: #1e40af; }
  `;
  shadow.appendChild(style);

  return shadow;
}

function repositionOverlay() {
  if (!currentTarget || !shadow) return;

  const rect = currentTarget.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const highlight = shadow.querySelector('.highlight') as HTMLElement | null;
  const card = shadow.querySelector('.card') as HTMLElement | null;

  if (highlight) {
    Object.assign(highlight.style, {
      top: `${rect.top - 4}px`,
      left: `${rect.left - 4}px`,
      width: `${rect.width + 8}px`,
      height: `${rect.height + 8}px`,
    });
  }

  if (card) {
    const pos = computeCardPosition(rect);
    card.style.top = `${pos.top}px`;
    card.style.left = `${pos.left}px`;
  }
}

function computeCardPosition(rect: DOMRect): { top: number; left: number } {
  const pad = 12;
  const cardW = 280;
  const cardH = 120;
  let cardTop: number;
  let cardLeft: number;

  if (window.innerHeight - rect.bottom > cardH + pad) {
    cardTop = rect.bottom + pad;
    cardLeft = Math.max(pad, Math.min(rect.left, window.innerWidth - cardW - pad));
  } else if (rect.top > cardH + pad) {
    cardTop = rect.top - cardH - pad;
    cardLeft = Math.max(pad, Math.min(rect.left, window.innerWidth - cardW - pad));
  } else if (rect.left > cardW + pad) {
    cardTop = Math.max(pad, Math.min(rect.top, window.innerHeight - cardH - pad));
    cardLeft = rect.left - cardW - pad;
  } else {
    cardTop = Math.max(pad, Math.min(rect.top, window.innerHeight - cardH - pad));
    cardLeft = rect.right + pad;
  }

  return {
    top: cardTop,
    left: Math.max(pad, Math.min(cardLeft, window.innerWidth - cardW - pad)),
  };
}

function showOverlay(step: GuidanceStep) {
  hideOverlay();
  currentStep = step;

  let target: Element | null = null;

  // 1. Try direct selector
  try {
    target = document.querySelector(step.selector);
  } catch {}

  // 2. Fallback: search by text/aria-label
  if (!target && step.textHint) {
    const hint = step.textHint.toLowerCase().trim();
    if (hint.length > 0) {
      const all = document.querySelectorAll(INTERACTIVE_SELECTOR);

      for (const el of all) {
        const elText = (el.textContent ?? '').toLowerCase().trim();
        if (elText === hint) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) { target = el; break; }
        }
      }

      if (!target && hint.length > 3) {
        for (const el of all) {
          const elText = (el.textContent ?? '').toLowerCase();
          if (elText.includes(hint) || hint.includes(elText.substring(0, 20))) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) { target = el; break; }
          }
        }
      }

      if (!target) {
        for (const el of all) {
          const aria = (el.getAttribute('aria-label') ?? '').toLowerCase();
          if (aria && (aria.includes(hint) || hint.includes(aria))) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) { target = el; break; }
          }
        }
      }
    }
  }

  if (!target) {
    log('Target not found:', step.selector, step.textHint);
    send({ type: 'ERROR', msg: 'Could not find the target element. Click Skip to try another.' });
    return;
  }

  currentTarget = target;
  const rect = target.getBoundingClientRect();
  const root = getOverlay();

  // Clear previous elements (keep style)
  for (const c of Array.from(root.children)) {
    if (c.tagName !== 'STYLE') c.remove();
  }

  // Highlight box
  const highlight = document.createElement('div');
  highlight.className = 'highlight';
  Object.assign(highlight.style, {
    top: `${rect.top - 4}px`,
    left: `${rect.left - 4}px`,
    width: `${rect.width + 8}px`,
    height: `${rect.height + 8}px`,
  });
  root.appendChild(highlight);

  // Instruction card
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-header">
      <span class="badge">NavAI</span>
      <span class="step-num">Step ${step.stepNumber}</span>
    </div>
    <div class="instruction">${escapeHtml(step.instruction)}</div>
    <button class="done-btn">Done &rarr;</button>
  `;

  const pos = computeCardPosition(rect);
  card.style.top = `${pos.top}px`;
  card.style.left = `${pos.left}px`;

  card.querySelector('.done-btn')!.addEventListener('click', () => {
    hideOverlay();
    send({ type: 'ACTION_DONE', action: step.action });
  });

  root.appendChild(card);

  // Scroll into view if needed
  if (rect.top < 0 || rect.bottom > window.innerHeight) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Start scroll/resize tracking
  window.addEventListener('scroll', repositionOverlay, { passive: true });
  window.addEventListener('resize', repositionOverlay, { passive: true });
  repositionInterval = setInterval(repositionOverlay, 300);

  listenForAction(target as HTMLElement, step);
}

function listenForAction(el: HTMLElement, step: GuidanceStep) {
  cleanupListener();

  if (step.action === 'click') {
    const handler = (e: Event) => {
      if (el.contains(e.target as Node)) {
        log('Click detected');
        cleanupListener();
        hideOverlay();
        send({ type: 'ACTION_DONE', action: 'click' });
      }
    };
    document.addEventListener('click', handler, true);
    actionCleanup = () => document.removeEventListener('click', handler, true);
  } else if (step.action === 'type') {
    let timer: ReturnType<typeof setTimeout>;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if ((el as HTMLInputElement).value || el.textContent) {
          log('Type detected');
          cleanupListener();
          hideOverlay();
          send({ type: 'ACTION_DONE', action: 'type' });
        }
      }, 1000);
    };
    el.addEventListener('input', handler);
    actionCleanup = () => { el.removeEventListener('input', handler); clearTimeout(timer); };
  } else if (step.action === 'select') {
    const handler = () => {
      log('Select detected');
      cleanupListener();
      hideOverlay();
      send({ type: 'ACTION_DONE', action: 'select' });
    };
    el.addEventListener('change', handler);
    actionCleanup = () => el.removeEventListener('change', handler);
  }
}

function cleanupListener() {
  if (actionCleanup) {
    actionCleanup();
    actionCleanup = null;
  }
}

function hideOverlay() {
  cleanupListener();
  currentStep = null;
  currentTarget = null;

  window.removeEventListener('scroll', repositionOverlay);
  window.removeEventListener('resize', repositionOverlay);
  if (repositionInterval) {
    clearInterval(repositionInterval);
    repositionInterval = null;
  }

  if (shadow) {
    for (const c of Array.from(shadow.children)) {
      if (c.tagName !== 'STYLE') c.remove();
    }
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

// ═════════════════════════════════════════════════════════════════
// SPA DETECTION
// ═════════════════════════════════════════════════════════════════

let lastUrl = location.href;

function watchNavigation() {
  const origPush = history.pushState;
  const origReplace = history.replaceState;

  history.pushState = function (...args) {
    origPush.apply(this, args);
    checkUrlChange();
  };
  history.replaceState = function (...args) {
    origReplace.apply(this, args);
    checkUrlChange();
  };

  window.addEventListener('popstate', checkUrlChange);
  window.addEventListener('hashchange', checkUrlChange);
}

function checkUrlChange() {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    log('URL changed:', lastUrl);
    send({ type: 'NAV_CHANGE', url: lastUrl });
  }
}

// ═════════════════════════════════════════════════════════════════
// MESSAGING
// ═════════════════════════════════════════════════════════════════

function send(msg: Message) {
  chrome.runtime.sendMessage(msg).catch(() => {});
}

chrome.runtime.onMessage.addListener((msg: Message, _sender, respond) => {
  log('Received:', msg.type);

  switch (msg.type) {
    case 'EXTRACT': {
      const data = extractPage();
      log(`Extracted ${data.elements.length} elements, topLayer=${data.hasOpenDialog}`);
      respond({ type: 'PAGE_DATA', data });
      return true;
    }

    case 'SHOW_STEP':
      showOverlay(msg.step);
      respond({ ok: true });
      return true;

    case 'HIDE_OVERLAY':
      hideOverlay();
      respond({ ok: true });
      return true;
  }

  return false;
});

// ═════════════════════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════════════════════

watchNavigation();
log('Content script ready');
