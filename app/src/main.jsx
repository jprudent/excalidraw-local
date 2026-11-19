// Minimal host for the official Excalidraw editor component: the scene is
// persisted in localStorage so a drawing survives a reload. No network
// backend, no accounts, no collaboration.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Excalidraw, restore, serializeAsJSON } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

const STORAGE_KEY = "excalidraw-local-scene";

function saveScene(elements, appState, files) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      serializeAsJSON(elements, appState, files, "local"),
    );
  } catch (error) {
    console.warn("could not save the scene", error);
  }
}

// Synchronous so the editor mounts on the first render, with or without a
// saved scene.
function loadScene() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  try {
    const { elements, appState, files } = restore(JSON.parse(saved), null, null);
    return { elements, appState, files };
  } catch (error) {
    console.warn("could not restore the saved scene", error);
    return null;
  }
}

function App() {
  const [initialData] = useState(loadScene);
  const latest = useRef(null);
  const timer = useRef();

  const onChange = useCallback((elements, appState, files) => {
    latest.current = [elements, appState, files];
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveScene(...latest.current), 400);
  }, []);

  // The debounce can lose the last stroke when the tab closes.
  useEffect(() => {
    const flush = () => {
      if (latest.current) {
        clearTimeout(timer.current);
        saveScene(...latest.current);
      }
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Excalidraw initialData={initialData} onChange={onChange} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
