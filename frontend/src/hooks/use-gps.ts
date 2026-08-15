import { useEffect, useState } from "react";

export type GPSData = {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  status: "SEARCHING" | "LOCKED" | "DENIED" | "UNAVAILABLE";
};

const INITIAL_GPS: GPSData = {
  latitude: null,
  longitude: null,
  speed: null,
  heading: null,
  accuracy: null,
  status: "SEARCHING",
};

export function useGPS() {
  const [gps, setGps] = useState<GPSData>(INITIAL_GPS);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGps((current) => ({
        ...current,
        status: "UNAVAILABLE",
      }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading, accuracy } =
          position.coords;

        setGps({
          latitude,
          longitude,
          speed: speed != null ? speed * 3.6 : null,
          heading,
          accuracy,
          status: "LOCKED",
        });
      },
      () => {
        setGps((current) => ({
          ...current,
          status: "DENIED",
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return gps;
}