import { useEffect } from "react";
import { DraggableItem } from "./types";

export const useInteractJS = (
  items: DraggableItem[],
  occupiedZones: number[],
  containerRef: React.RefObject<HTMLDivElement | null>,
  setItems: React.Dispatch<React.SetStateAction<DraggableItem[]>>,
  layouts: any[]
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
            element.style.transition = "none";
            
            const rect = element.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();
            
            currentPos.x = rect.left - containerRect.left;
            currentPos.y = rect.top - containerRect.top;
            
            element.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px)`;
            
            setItems((prev) => {
              const updated = prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { 
                      ...prevItem, 
                      isRectangle: true,
                      x: currentPos.x,
                      y: currentPos.y
                    }
                  : prevItem
              );
              
              return updated;
            });
          },

          move(event: any) {
            currentPos.x += event.dx;
            currentPos.y += event.dy;
            element.style.transform = `translate(${currentPos.x}px, ${currentPos.y}px)`;
          },

          end() {
            const targetRect = element.getBoundingClientRect();
            const leftPanel = document.querySelector(".left-panel");
            const leftRect = leftPanel?.getBoundingClientRect();
            const zones = document.querySelectorAll(".drop-zone");

            let foundZone = false;
            let targetZoneIndex = -1;
            let isInLeftPanel = false;

            const squareCenterX = targetRect.left + targetRect.width / 2;
            if (leftRect && squareCenterX >= leftRect.left && squareCenterX <= leftRect.right) {
              isInLeftPanel = true;
              foundZone = false;
              targetZoneIndex = -1;
            } else {
              const currentOccupiedZones = items
                .filter(prevItem => 
                  prevItem.id !== item.id &&
                  prevItem.isRectangle && 
                  prevItem.dropZoneIndex !== undefined
                )
                .map(prevItem => prevItem.dropZoneIndex as number);

              zones.forEach((zone) => {
                const zoneIndexAttr = zone.getAttribute("data-zone-index");
                if (!zoneIndexAttr) return;

                const zoneIndex = parseInt(zoneIndexAttr);
                const zoneRect = zone.getBoundingClientRect();
                const squareCenterX = targetRect.left + targetRect.width / 2;
                const squareCenterY = targetRect.top + targetRect.height / 2;

                if (
                  squareCenterX >= zoneRect.left &&
                  squareCenterX <= zoneRect.right &&
                  squareCenterY >= zoneRect.top &&
                  squareCenterY <= zoneRect.bottom &&
                  !currentOccupiedZones.includes(zoneIndex)
                ) {
                  foundZone = true;
                  targetZoneIndex = zoneIndex;

                  const zoneCenterX = zoneRect.left + zoneRect.width / 2;
                  const zoneCenterY = zoneRect.top + zoneRect.height / 2;
                  const containerRect = containerRef.current!.getBoundingClientRect();

                  currentPos.x = zoneCenterX - containerRect.left - targetRect.width / 2;
                  currentPos.y = zoneCenterY - containerRect.top - targetRect.height / 2;
                }
              });
            }

            element.style.transition = "all 0.2s";

            setItems((prev) => {
              const updated = prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { 
                      ...prevItem, 
                      x: currentPos.x, 
                      y: currentPos.y, 
                      isRectangle: !isInLeftPanel,
                      dropZoneIndex: foundZone ? targetZoneIndex : undefined
                    }
                  : prevItem
              );

              if (foundZone) {
                const rectangleItems = updated.filter(item => item.isRectangle && item.dropZoneIndex !== undefined);
                const formObject = rectangleItems.reduce((acc, rectItem) => {
                  if (rectItem.fields.label) {
                    const key = rectItem.fields.label.toLowerCase().replaceAll(" ", "");
                    acc[key] = rectItem.fields;
                  }
                  return acc;
                }, {} as Record<string, any>);
                
                console.log("📋 Objeto Form al soltar:", formObject);
              }
              
              return updated;
            });
          },
        },
      });
    });
  }, [items, occupiedZones, setItems, containerRef, layouts]);
};