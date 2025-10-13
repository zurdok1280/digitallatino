import { densityConfig } from "../config/densityConfig";

export const useDensityStyles = () => {
  const getSizeClass = (comfortable: string, compact: string) => {
    return densityConfig.mode === "compact" ? compact : comfortable;
  };

  return {
    isCompact: densityConfig.mode === "compact",
    getSizeClass,

    // Configuraciones predefinidas
    avatar: getSizeClass("h-14 w-14", "h-10 w-10"),
    padding: getSizeClass("p-6 py-4", "p-4 py-3"),
    gap: getSizeClass("gap-3", "gap-2"),
    text: {
      title: getSizeClass("text-base", "text-sm"),
      body: getSizeClass("text-sm", "text-xs"),
      small: getSizeClass("text-[9px]", "text-[7px]"),
      number: getSizeClass("text-lg", "text-base"),
    },
    dimensions: {
      rank: getSizeClass("w-11 h-11", "w-9 h-9"),
      card: getSizeClass("min-w-[130px]", "min-w-[100px]"),
    },
  };
};
