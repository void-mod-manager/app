import { useCallback, useMemo, useState } from "react";

export interface ViewManager<V extends string> {
  currentView: V;
  showView: (view: V) => void;
  isActive: (view: V) => boolean;
}

export function useViewManager<V extends string>(
  initialView: V,
  allViews?: Readonly<V[]>,
): ViewManager<V> {
  const [currentView, setCurrentView] = useState<V>(initialView);

  const showView = useCallback((view: V) => {
    setCurrentView((prev) => (prev === view ? prev : view));
  }, []);

  const isActive = useCallback(
    (view: V) => currentView === view,
    [currentView],
  );

  return useMemo(
    () => ({ currentView, showView, isActive }),
    [currentView, showView, isActive],
  );
}
