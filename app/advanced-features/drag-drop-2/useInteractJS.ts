import { useEffect } from "react";
import { DraggableItem } from "./types";

export const useInteractJS = (
  items: DraggableItem[],
  occupiedZones: number[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>,
) => {
  useEffect(() => {
    const interact = (window as any).interact;
    if (!interact || !containerRef.current) return;

    items.forEach((item) => {
      const element = item.ref.current;
      if (!element) return;

      if (element.dataset.interactInitialized === "true") return;
      element.dataset.interactInitialized = "true";

      let currentPos = { x: item.x, y: item.y };

      interact(element).draggable({
        listeners: {
          start(event: any) {
            element.style.zIndex = "1000";
            element.style.transition = "none";
          },

          move(event: any) {
            currentPos.x += event.dx;
            currentPos.y += event.dy;
            element.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px)`;
          },

          end(event: any) {
            element.style.zIndex = "";
            element.style.transition = "all 0.3s ease";

            const targetRect = element.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();

            // Buscar zona de drop
            const zones = document.querySelectorAll(".drop-zone");
            let foundZoneIndex = -1;

            zones.forEach((zone) => {
              const zoneIndex = zone.getAttribute("data-zone-index");
              if (!zoneIndex) return;

              const zoneIndexNum = parseInt(zoneIndex);
              const zoneRect = zone.getBoundingClientRect();
              
              const elementCenterX = targetRect.left + targetRect.width / 2;
              const elementCenterY = targetRect.top + targetRect.height / 2;

              const isInZone = (
                elementCenterX >= zoneRect.left &&
                elementCenterX <= zoneRect.right &&
                elementCenterY >= zoneRect.top &&
                elementCenterY <= zoneRect.bottom
              );

              if (isInZone && !occupiedZones.includes(zoneIndexNum)) {
                foundZoneIndex = zoneIndexNum;
                
                const zoneCenterX = zoneRect.left + zoneRect.width / 2;
                const zoneCenterY = zoneRect.top + zoneRect.height / 2;
                
                currentPos.x = zoneCenterX - containerRect.left - targetRect.width / 2;
                currentPos.y = zoneCenterY - containerRect.top - targetRect.height / 2;
                
                element.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px)`;
              }
            });

            // Actualizar estado del item
            setItems(prev => prev.map(prevItem =>
              prevItem.id === item.id
                ? { 
                    ...prevItem, 
                    x: currentPos.x, 
                    y: currentPos.y,
                    isRectangle: foundZoneIndex !== -1,
                    dropZoneIndex: foundZoneIndex !== -1 ? foundZoneIndex : undefined
                  }
                : prevItem
            ));
          },
        },
      });
    });
  }, [items, occupiedZones, setItems, containerRef]);
};