"use client";

import { useEffect, useState } from "react";

interface CardItem {
  id: string;
  price: number;
  previousPrice?: number;
  originalTimestamp: string;
}

/* Cálculo congelado (sin segundos) */
function frozenTimeAgo(originalISO: string) {
  const original = new Date(originalISO);
  const now = new Date();

  const diffMs = now.getTime() - original.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/* Color según cambio */
function getCardColor(item: CardItem) {
  if (item.previousPrice == null) return "#f0f0f0"; // primera vez → gris
  if (item.price > item.previousPrice) return "#c6ffd1"; // verde suave
  if (item.price < item.previousPrice) return "#ffd6d6"; // rojo suave
  return "#f0f0f0";
}

/* ID único */
function uid() {
  return Math.random().toString(36).substring(2) + Date.now();
}

export default function Page() {
  const [cards, setCards] = useState<CardItem[]>([]);

  /* ===============================================================
     CARGA INICIAL - crea PRIMERA tarjeta
     =============================================================== */
  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((btc) => {
        setCards([
          {
            id: uid(),
            price: btc.price,
            originalTimestamp: btc.lastUpdated,
          },
        ]);
      });
  }, []);

  /* ===============================================================
     ACTUALIZACIONES CADA 30s - CREA UNA NUEVA TARJETA
     =============================================================== */
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api")
        .then((res) => res.json())
        .then((btc) => {
          setCards((prev) => {
            const last = prev[prev.length - 1]; // última tarjeta

            return [
              ...prev,
              {
                id: uid(),
                price: btc.price,
                originalTimestamp: btc.lastUpdated,
                previousPrice: last ? last.price : undefined,
              },
            ];
          });
        });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        padding: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 20,
      }}
    >
      {cards.map((item) => {
        const timeAgo = frozenTimeAgo(item.originalTimestamp);
        const bgColor = getCardColor(item);

        return (
          <div
            key={item.id}
            style={{
              padding: 20,
              borderRadius: 10,
              border: "1px solid #eee",
              background: bgColor,
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <h1>Bitcoin</h1>

            <h2>
              $
              {item.price.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h2>

            <p style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              Actualizado hace: {timeAgo}
            </p>

            <p style={{ marginTop: 4, fontSize: 11, opacity: 0.5 }}>
              Fecha API: {item.originalTimestamp}
            </p>
          </div>
        );
      })}
    </div>
  );
}
