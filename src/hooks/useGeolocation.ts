import { useState, useEffect } from 'react';
import { CITIES } from '../types/weather';
import type { Location } from '../types/weather';
import { toGrid } from '../utils/gridConvert';

function findNearestCity(lat: number, lng: number): Location {
  const { nx, ny } = toGrid(lat, lng);
  let nearest = CITIES[0];
  let minDist = Infinity;
  for (const city of CITIES) {
    const dist = (city.nx - nx) ** 2 + (city.ny - ny) ** 2;
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest;
}

export function useGeolocation() {
  const [nearestCity, setNearestCity] = useState<Location | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearestCity(findNearestCity(pos.coords.latitude, pos.coords.longitude));
      },
      () => {
        // 거부 또는 에러 — 무시
      },
      { timeout: 5000 },
    );
  }, []);

  return { nearestCity };
}
