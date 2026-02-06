// NavAI — Background Service Worker

import type { Message, SessionState, PageData, GuidanceStep, LLMConfig } from './shared/types';
import { heuristicPlan, llmPlan, isSuccessPage } from './shared/planner';

const log = (...a: unknown[]) => console.debug('[NavAI:bg]', ...a);

// ═════════════════════════════════════════════════════════════════
// STATE
// ═════════════════════════════════════════════════════════════════

const EMPTY_STATE: SessionState = {
  goal: '',
  active: false,
  completed: false,
  step: 1,
  current: null,
  history: [],
  mode: 'heuristic',
};

let state: SessionState = { ...EMPTY_STATE };
let llmConfig: LLMConfig | null = null;
let processing = false;

async function saveState() {
  await chrome.storage.local.set({ navai_state: state });
}

async function loadState() {
  const r = await chrome.storage.local.get(['navai_state', 'navai_llm']);
  if (r.navai_state) state = { ...EMPTY_STATE, ...r.navai_state };
  if (r.navai_llm) llmConfig = r.navai_llm;
}

// ═════════════════════════════════════════════════════════════════
// SIDE PANEL
// ═════════════════════════════════════════════════════════════════

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// ═════════════════════════════════════════════════════════════════
// RESTRICTED URL CHECK
// ═════════════════════════════════════════════════════════════════

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return url.startsWith('chrome://') ||
         url.startsWith('chrome-extension://') ||
         url.startsWith('edge://') ||
         url.startsWith('about:') ||
         url.startsWith('chrome-search://') ||
         url.startsWith('devtools://');
}

// ═════════════════════════════════════════════════════════════════
// PLANNER
// ═════════════════════════════════════════════════════════════════

async function plan(page: PageData): Promise<GuidanceStep | null> {
  log('Planning...', state.mode);

  if (state.mode === 'llm' && llmConfig?.apiKey) {
    const step = await llmPlan(page, state, llmConfig);
    if (step) return step;
    log('LLM failed, falling back to heuristic');
  }

  return heuristicPlan(page, state);
}

// ═════════════════════════════════════════════════════════════════
// LOOP DETECTION
// ═════════════════════════════════════════════════════════════════

function isStuck(step: GuidanceStep): boolean {
  const recent = state.history.slice(-3);
  if (recent.length < 3) return false;
  const sameSelector = recent.every(h => h.selector === step.selector);
  const sameText = step.textHint.length > 3 && recent.every(h => h.text === step.textHint);
  return sameSelector || sameText;
}

// ═════════════════════════════════════════════════════════════════
// CORE FLOW
// ═════════════════════════════════════════════════════════════════

async function processTab(tabId: number) {
  if (!state.active || state.completed) return;
  if (processing) {
    log('Already processing, skipping');
    return;
  }

  processing = true;
  log('Processing tab', tabId);

  try {
    // Check if tab URL is restricted
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    if (!tab || isRestrictedUrl(tab.url)) {
      broadcast({ type: 'ERROR', msg: 'NavAI cannot run on this page. Navigate to a regular website to continue.' });
      return;
    }

    const resp = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT' } as Message);

    if (!resp || resp.type !== 'PAGE_DATA') {
      log('No page data');
      broadcast({ type: 'ERROR', msg: 'Could not read this page. Try refreshing or navigating to another page.' });
      return;
    }

    const page: PageData = resp.data;
    log(`Page: ${page.url}, ${page.elements.length} elements, dialog: ${page.hasOpenDialog}`);

    // Check for completion
    if (state.step > 1 && isSuccessPage(page)) {
      log('Success page detected!');
      state.completed = true;
      state.current = null;
      await saveState();
      broadcast({ type: 'STATE', state: { ...state } });
      broadcast({ type: 'COMPLETED' });
      await chrome.tabs.sendMessage(tabId, { type: 'HIDE_OVERLAY' } as Message).catch(() => {});
      return;
    }

    let step = await plan(page);

    if (step && isStuck(step)) {
      log('Stuck loop detected');
      broadcast({ type: 'ERROR', msg: 'Seems stuck on the same element. Try clicking Skip or rephrase your goal.' });
      step = null;
    }

    if (step) {
      state.current = step;
      await saveState();
      broadcast({ type: 'STATE', state: { ...state } });
      await chrome.tabs.sendMessage(tabId, { type: 'SHOW_STEP', step } as Message);
    } else if (!state.completed) {
      state.current = null;
      await saveState();
      broadcast({ type: 'STATE', state: { ...state } });
      broadcast({ type: 'ERROR', msg: 'No clear next step found. Try "Rescan" or scroll to reveal more elements.' });
    }
  } catch (e) {
    log('Process error:', e);
    // Retry once after delay (content script may not be ready)
    setTimeout(async () => {
      try {
        const resp = await chrome.tabs.sendMessage(tabId, { type: 'EXTRACT' } as Message);
        if (resp?.type === 'PAGE_DATA') {
          const step = await plan(resp.data);
          if (step) {
            state.current = step;
            await saveState();
            broadcast({ type: 'STATE', state: { ...state } });
            await chrome.tabs.sendMessage(tabId, { type: 'SHOW_STEP', step } as Message);
          }
        }
      } catch {
        broadcast({ type: 'ERROR', msg: 'Could not connect to this page. Try refreshing.' });
      }
    }, 1000);
  } finally {
    processing = false;
  }
}

async function getActiveTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

function broadcast(msg: Message) {
  chrome.runtime.sendMessage(msg).catch(() => {});
}

// ═════════════════════════════════════════════════════════════════
// MESSAGE HANDLING
// ═════════════════════════════════════════════════════════════════

chrome.runtime.onMessage.addListener((msg: Message, sender, respond) => {
  log('Message:', msg.type);

  switch (msg.type) {
    case 'START': {
      state = {
        ...EMPTY_STATE,
        goal: msg.goal,
        active: true,
        completed: false,
        mode: msg.mode,
      };
      saveState().then(async () => {
        broadcast({ type: 'STATE', state: { ...state } });
        const id = await getActiveTabId();
        if (id) processTab(id);
      });
      respond({ ok: true });
      return true;
    }

    case 'STOP': {
      state = { ...EMPTY_STATE };
      saveState().then(async () => {
        broadcast({ type: 'STATE', state: { ...state } });
        const id = await getActiveTabId();
        if (id) chrome.tabs.sendMessage(id, { type: 'HIDE_OVERLAY' } as Message).catch(() => {});
      });
      respond({ ok: true });
      return true;
    }

    case 'SKIP': {
      if (state.current) {
        state.history.push({
          step: state.step,
          action: state.current.action,
          selector: state.current.selector,
          text: state.current.textHint,
        });
      }
      state.step++;
      state.current = null;
      saveState().then(async () => {
        broadcast({ type: 'STATE', state: { ...state } });
        const id = await getActiveTabId();
        if (id) processTab(id);
      });
      respond({ ok: true });
      return true;
    }

    case 'RESCAN': {
      getActiveTabId().then(id => { if (id) processTab(id); });
      respond({ ok: true });
      return true;
    }

    case 'ACTION_DONE': {
      if (!state.active) return false;
      log('Action done:', msg.action);

      if (state.current) {
        state.history.push({
          step: state.step,
          action: msg.action,
          selector: state.current.selector,
          text: state.current.textHint,
        });
      }
      state.step++;
      state.current = null;

      saveState().then(() => {
        broadcast({ type: 'STATE', state: { ...state } });
        setTimeout(async () => {
          const id = sender.tab?.id ?? await getActiveTabId();
          if (id) processTab(id);
        }, msg.action === 'click' ? 500 : 100);
      });
      respond({ ok: true });
      return true;
    }

    case 'NAV_CHANGE': {
      if (!state.active) return false;
      log('Nav change:', msg.url);
      const tabId = sender.tab?.id;
      if (tabId) setTimeout(() => processTab(tabId), 600);
      respond({ ok: true });
      return true;
    }

    case 'GET_STATE': {
      respond({ type: 'STATE', state: { ...state } });
      return true;
    }
  }

  return false;
});

// ═════════════════════════════════════════════════════════════════
// NAVIGATION LISTENER
// ═════════════════════════════════════════════════════════════════

chrome.webNavigation.onCompleted.addListener(details => {
  if (details.frameId !== 0) return;
  if (!state.active) return;
  log('Page loaded:', details.url);
  setTimeout(() => processTab(details.tabId), 500);
});

// ═════════════════════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════════════════════

loadState().then(() => log('Background ready, active:', state.active));
