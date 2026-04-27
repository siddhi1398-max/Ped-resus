import { createContext, useContext, useState, useMemo } from "react";

const WeightContext = createContext(null);

export function WeightProvider({ children }) {
  const [weight, setWeight] = useState(20);
  const value = useMemo(() => ({ weight, setWeight }), [weight]);
  return <WeightContext.Provider value={value}>{children}</WeightContext.Provider>;
}

export function useWeight() {
  const ctx = useContext(WeightContext);
  if (!ctx) throw new Error("useWeight must be inside WeightProvider");
  return ctx;
}
