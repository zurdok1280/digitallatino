import { useEffect } from "react";

export const useTableWidthFix = (isExpanded: boolean) => {
  useEffect(() => {
    if (!isExpanded) return;

    const fixTableWidths = () => {
      // Encontrar todas las tablas dentro del expand row
      const tables = document.querySelectorAll(
        ".expand-row-container table, .expand-row-container .MuiTableContainer-root"
      );

      tables.forEach((table) => {
        const tableElement = table as HTMLElement;
        const parentWidth = tableElement.closest(
          ".expand-row-container"
        )?.clientWidth;

        if (parentWidth && tableElement.clientWidth > parentWidth) {
          tableElement.style.width = `${parentWidth}px`;
          tableElement.style.maxWidth = `${parentWidth}px`;
          tableElement.style.tableLayout = "fixed";
        }
      });
    };

    // Ejecutar inmediatamente y después de un delay
    fixTableWidths();
    setTimeout(fixTableWidths, 100); // Para componentes que se cargan async

    // Limpiar
    return () => {
      const tables = document.querySelectorAll(
        ".expand-row-container table, .expand-row-container .MuiTableContainer-root"
      );
      tables.forEach((table) => {
        const tableElement = table as HTMLElement;
        tableElement.style.width = "";
        tableElement.style.maxWidth = "";
        tableElement.style.tableLayout = "";
      });
    };
  }, [isExpanded]);
};
