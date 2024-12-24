"use client";
// Install dependencies:
// npm install mapbox-gl @mapbox/mapbox-gl-geocoder

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { RiArrowLeftLine, RiCheckLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import {
  Customer,
  CustomerUpdateLocationDto,
  SuccessResponse,
} from "@/src/interface";
import { baseUrl } from "@/src/util/services";
import { useCustomerStore } from "@/src/store/customer";
import toast, { Toaster } from "react-hot-toast";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2l0dG9rYXR0byIsImEiOiJja2t5eTducm4wYmhwMnFwNXI4ejA4cGhuIn0.xoSKS41bJtuetZ8v5p_aiQ"; // Ganti dengan token Mapbox Anda

const EditLocation = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [longitude, setLongitude] = useState<number>(106.8456); // Default Jakarta
  const [latitude, setLatitude] = useState<number>(-6.2088);
  const [locationName, setLocationName] = useState<string>("Loading...");

  const router = useRouter();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inisialisasi Mapbox
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [longitude, latitude],
      zoom: 12,
    });

    mapRef.current = map;

    // Tambahkan geocoder
    const geocoder = new MapboxGeocoder({
      marker: false,
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });

    map.addControl(geocoder);

    // Tambahkan marker awal
    const initialMarker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    markerRef.current = initialMarker;

    // Pindahkan marker saat peta diklik
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Hapus marker lama jika ada
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Buat marker baru
      const newMarker = new mapboxgl.Marker({
        draggable: true,
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = newMarker;

      setLongitude(lng);
      setLatitude(lat);
      fetchLocationName(lng, lat);
    });

    // Update marker saat menggunakan geocoder
    geocoder.on("result", (e) => {
      const { center, place_name } = e.result;
      if (center) {
        // Hapus marker lama jika ada
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Buat marker baru
        const newMarker = new mapboxgl.Marker({
          draggable: true,
        })
          .setLngLat(center)
          .addTo(map);

        markerRef.current = newMarker;

        setLongitude(center[0]);
        setLatitude(center[1]);
        setLocationName(place_name || "Location not found");
      }
    });

    // Bersihkan instance Mapbox saat komponen unmount
    return () => {
      map.remove();
      mapRef.current = null;

      // Hapus marker jika masih ada
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = null;
    };
  }, []);

  const fetchLocationName = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      const placeName = data.features?.[0]?.place_name || "Unknown location";
      setLocationName(
        placeName.length > 255 ? placeName.slice(0, 252) + "..." : placeName
      );
    } catch (error) {
      console.log(error);
      setLocationName("Failed to fetch location name");
    }
  };

  useEffect(() => {
    fetchLocationName(longitude, latitude);
  }, [longitude, latitude]);

  const customer = useCustomerStore((state) => state.customer);
  const setCustomer = useCustomerStore((state) => state.setCustomer);

  const updateLocationMutation = useMutation<
    AxiosResponse<SuccessResponse<Customer>>,
    AxiosError<{ message: string }>,
    CustomerUpdateLocationDto
  >({
    mutationFn: (data: CustomerUpdateLocationDto) => {
      return axios.post(
        `${baseUrl}/api/v1/customers/${customer?.id}/update-location`,
        data
      );
    },
    onSuccess: (data) => {
      //   const successMessage = data.data.message;
      //   toast.success(successMessage);
      setCustomer(data.data.data);
      router.back();
    },
    onError: (error) => {
      const errorMessage = error.response?.data.message ?? "Terjadi kesalahan";
      toast.error(errorMessage);
    },
  });

  const onClickSave = () => {
    updateLocationMutation.mutate({
      longitude: longitude,
      latitude: latitude,
      location: locationName,
    });
  };

  return (
    <html lang="en" data-theme="lofi">
      <body className="bg-slate-300">
        <div className="bg-slate-100 max-w-screen-sm mx-auto relative min-h-dvh flex flex-col">
          <div className="px-4 py-3 text-xl font-semibold flex items-center justify-between bg-white">
            <div className="flex items-center">
              <div className="me-2">
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => {
                    router.back();
                  }}
                >
                  <RiArrowLeftLine />
                </button>
              </div>
              <div>Ubah Lokasi</div>
            </div>
            <div>
              {updateLocationMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <button
                  className="btn btn-circle btn-ghost"
                  onClick={() => {
                    onClickSave();
                  }}
                >
                  <RiCheckLine size={30} />
                </button>
              )}
            </div>
          </div>
          <div className="relative h-dvh flex-1 flex flex-col">
            <div ref={mapContainerRef} className="w-full flex-1"></div>
            <div className="absolute bottom-0 w-full bg-white p-2 text-center shadow-md z-50">
              <p className="m-0 text-sm overflow-hidden text-ellipsis">
                {locationName}
              </p>
            </div>
          </div>
        </div>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
};

export default EditLocation;
