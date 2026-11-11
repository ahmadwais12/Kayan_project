"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type QueuedEvent = {
  eventType: "VIEW" | "CLICK";
  entityType: string;
  entityId: string;
  entityTitle: string;
  path: string;
};

const SESSION_KEY = "kl_sid";
const VIEW_PREFIX = "kl_cv_";

function readSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "";
  }
}

function alreadyCounted(key: string) {
  try {
    if (sessionStorage.getItem(key)) return true;
    sessionStorage.setItem(key, "1");
    return false;
  } catch {
    return false;
  }
}

function pageTypeOf(pathname: string) {
  if (pathname.startsWith("/projects/")) return "project";
  if (pathname.startsWith("/services/")) return "service";
  if (pathname.startsWith("/blog/")) return "article";
  return "page";
}

function postCardEvents(events: QueuedEvent[]) {
  if (!events.length) return;
  const payload = JSON.stringify({ events });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/card", new Blob([payload], { type: "application/json" }));
    return;
  }
  fetch("/api/analytics/card", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const sessionId = readSessionId();

    const viewKey = `kl_view_${pathname}`;
    if (!alreadyCounted(viewKey)) {
      const payload = JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
        title: document.title.slice(0, 200),
        pageType: pageTypeOf(pathname),
        sessionId,
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/analytics/view", new Blob([payload], { type: "application/json" }));
      } else {
        fetch("/api/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => undefined);
      }
    }

    const queue: QueuedEvent[] = [];
    let flushTimer: ReturnType<typeof setTimeout> | null = null;

    const push = (event: QueuedEvent) => {
      queue.push(event);
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = setTimeout(() => {
        flushTimer = null;
        postCardEvents(queue.splice(0, queue.length));
      }, 900);
    };

    const viewCard = (element: HTMLElement) => {
      const entityType = element.dataset.cardType;
      const entityId = element.dataset.cardId;
      const entityTitle = element.dataset.cardTitle;
      if (!entityType || !entityId || !entityTitle) return;
      if (alreadyCounted(`${VIEW_PREFIX}${entityType}_${entityId}`)) return;
      push({ eventType: "VIEW", entityType, entityId, entityTitle, path: pathname });
    };

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          viewCard(entry.target as HTMLElement);
        }
      },
      { threshold: 0.5 },
    );

    const register = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>("[data-card-type][data-card-id]").forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        observer.observe(element);
      });
    };

    register(document);

    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches("[data-card-type][data-card-id]") && !seen.has(node)) {
            seen.add(node);
            observer.observe(node);
          }
          register(node);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-card-type][data-card-id]") : null;
      if (!target) return;
      const { cardType, cardId, cardTitle } = target.dataset;
      if (!cardType || !cardId || !cardTitle) return;
      push({ eventType: "CLICK", entityType: cardType, entityId: cardId, entityTitle: cardTitle, path: pathname });
    };
    document.addEventListener("click", onClick, true);

    const flush = () => {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      postCardEvents(queue.splice(0, queue.length));
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      const pending = queue.splice(0, queue.length);
      if (pending.length) postCardEvents(pending);
    };
  }, [pathname]);

  return null;
}
