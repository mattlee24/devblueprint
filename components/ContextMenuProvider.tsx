"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { ContextMenu, type ContextMenuState, type ContextType } from "./ContextMenu";
import { GlobalContextMenu } from "./GlobalContextMenu";

type MenuState =
  | { kind: "entity"; x: number; y: number; type: ContextType; id: string }
  | { kind: "global"; x: number; y: number }
  | null;

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MenuState>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const el = target.closest("[data-context-menu]") as HTMLElement | null;
    if (el) {
      const type = el.getAttribute("data-context-menu") as ContextType | null;
      const id = el.getAttribute("data-context-id");
      if (type && id && (type === "client" || type === "project" || type === "invoice" || type === "proposal")) {
        e.preventDefault();
        setState({ kind: "entity", x: e.clientX, y: e.clientY, type, id });
        return;
      }
    }
    e.preventDefault();
    setState({ kind: "global", x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [handleContextMenu]);

  const close = useCallback(() => setState(null), []);

  return (
    <>
      {children}
      {typeof document !== "undefined" && state && state.kind === "entity" &&
        createPortal(
          <ContextMenu
            state={{ x: state.x, y: state.y, type: state.type, id: state.id }}
            onClose={close}
          />,
          document.body
        )}
      {typeof document !== "undefined" && state && state.kind === "global" &&
        createPortal(
          <GlobalContextMenu x={state.x} y={state.y} onClose={close} />,
          document.body
        )}
    </>
  );
}