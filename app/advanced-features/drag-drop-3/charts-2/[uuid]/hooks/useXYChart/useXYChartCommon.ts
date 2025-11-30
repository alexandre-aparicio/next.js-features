// /lib/hooks/useXYChartCommon.ts
import { useRef, useEffect } from "react";

declare const window: any;

export interface XYChartCommon {
  rootRef: React.MutableRefObject<any>;
  loadAmCharts: (additionalScripts?: Array<{src: string, key: string}>) => Promise<void>;
  safeDispose: () => void;
}

export const useXYChartCommon = (): XYChartCommon => {
  const rootRef = useRef<any>(null);

  const loadAmCharts = (additionalScripts: Array<{src: string, key: string}> = []) => {
    return new Promise<void>((resolve) => {
      if (typeof window === "undefined") return resolve();

      const baseScripts = [
        { src: "https://cdn.amcharts.com/lib/5/index.js", key: "am5" },
        { src: "https://cdn.amcharts.com/lib/5/xy.js", key: "am5xy" },
        { src: "https://cdn.amcharts.com/lib/5/themes/Animated.js", key: "am5themes_Animated" }
      ];

      const scripts = [...baseScripts, ...additionalScripts];
      
      // Verificar si todos los scripts ya están cargados
      const allLoaded = scripts.every(script => window[script.key]);
      if (allLoaded) {
        return resolve();
      }

      let loaded = 0;

      scripts.forEach(({ src, key }) => {
        if (window[key]) {
          loaded++;
          if (loaded === scripts.length) resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;

        script.onload = () => {
          loaded++;
          if (loaded === scripts.length) resolve();
        };

        document.head.appendChild(script);
      });
    });
  };

  const safeDispose = () => {
    if (rootRef.current) {
      try {
        if (!rootRef.current.isDisposed()) rootRef.current.dispose();
      } catch (e) {
        // ignore dispose errors
      }
      rootRef.current = null;
    }
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      safeDispose();
    };
  }, []);

  return {
    rootRef,
    loadAmCharts,
    safeDispose
  };
};

// Función común para obtener series names
export const getSeriesNames = (data: any[]): string[] => {
  return [...new Set(
    data.flatMap(item => 
      Object.keys(item).filter(key => 
        key !== 'category' && 
        key !== 'total' && 
        key !== 'fullCategory' && 
        key !== 'realPercent' &&
        key !== 'animal'
      )
    )
  )];
};

// Colores comunes
export const getColors = (am5: any) => [
  am5.color("#3B82F6"), // Azul
  am5.color("#EC4899"), // Rosa
  am5.color("#10B981"), // Verde
  am5.color("#F59E0B"), // Amarillo
  am5.color("#8B5CF6"), // Púrpura
  am5.color("#EF4444"), // Rojo
  am5.color("#06B6D4"), // Cian
  am5.color("#84CC16"), // Verde lima
];

// Colores pastel "fofis"
export const getPastelColors = (am5: any) => [
  am5.color("#A78BFA"), // Lavanda suave
  am5.color("#FBBF24"), // Amarillo pastel
  am5.color("#34D399"), // Verde menta
  am5.color("#F87171"), // Coral suave
  am5.color("#60A5FA"), // Azul cielo
  am5.color("#F472B6"), // Rosa pastel
  am5.color("#4ADE80"), // Verde manzana
  am5.color("#FB923C"), // Naranja suave
];