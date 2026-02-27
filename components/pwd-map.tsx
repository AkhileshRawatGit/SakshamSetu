"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"

// Approximate coordinates for major Indian regions/cities
const REGION_COORDS: Record<string, [number, number]> = {
  // States & cities commonly used as regions
  Delhi: [28.6139, 77.209],
  "New Delhi": [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882],
  Patna: [25.5941, 85.1376],
  Indore: [22.7196, 75.8577],
  Bhopal: [23.2599, 77.4126],
  Visakhapatnam: [17.6868, 83.2185],
  Vadodara: [22.3072, 73.1812],
  Surat: [21.1702, 72.8311],
  Coimbatore: [11.0168, 76.9558],
  Agra: [27.1767, 78.0081],
  Varanasi: [25.3176, 82.9739],
  Meerut: [28.9845, 77.7064],
  Rajkot: [22.3039, 70.8022],
  Nashik: [19.9975, 73.7898],
  Faridabad: [28.4089, 77.3178],
  Ghaziabad: [28.6692, 77.4538],
  Ranchi: [23.3441, 85.3096],
  Chandigarh: [30.7333, 76.7794],
  Dehradun: [30.3165, 78.0322],
  Bhubaneswar: [20.2961, 85.8245],
  Guwahati: [26.1445, 91.7362],
  Amritsar: [31.634, 74.8723],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kochi: [9.9312, 76.2673],
  Raipur: [21.2514, 81.6296],
  Jodhpur: [26.2389, 73.0243],
  Madurai: [9.9252, 78.1198],
  Gwalior: [26.2183, 78.1828],
  Vijayawada: [16.5062, 80.648],
  Jammu: [32.7266, 74.857],
  Shimla: [31.1048, 77.1734],
  Panaji: [15.4909, 73.8278],
  Imphal: [24.817, 93.9368],
  Shillong: [25.5788, 91.8933],
  Aizawl: [23.7271, 92.7176],
  Kohima: [25.6701, 94.1077],
  Agartala: [23.8315, 91.2868],
  Gangtok: [27.3389, 88.6065],
  Itanagar: [27.0844, 93.6053],
  Dispur: [26.1433, 91.7898],
  // Fallback for unknown
  India: [20.5937, 78.9629],
}

function getCoords(region: string): [number, number] {
  // Try exact match first
  if (REGION_COORDS[region]) return REGION_COORDS[region]
  // Try case-insensitive partial match
  const key = Object.keys(REGION_COORDS).find((k) =>
    k.toLowerCase().includes(region.toLowerCase()) ||
    region.toLowerCase().includes(k.toLowerCase())
  )
  return key ? REGION_COORDS[key] : REGION_COORDS["India"]
}

function getMarkerColor(count: number): string {
  if (count >= 20) return "#dc2626" // red - high
  if (count >= 10) return "#f97316" // orange - medium
  if (count >= 5) return "#eab308"  // yellow - moderate
  return "#16a34a"                   // green - low
}

export interface PwdMapData {
  region: string
  count: number
  aid: string
  disability: string
}

interface PwdMapProps {
  data: PwdMapData[]
  selectedRegion: string
}

export default function PwdMap({ data, selectedRegion }: PwdMapProps) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Dynamically import leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon path issue with bundlers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      if (!mapRef.current) return

      // Initialize map only once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
        })

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(mapInstanceRef.current)
      }

      const map = mapInstanceRef.current

      // Remove existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      if (data.length === 0) return

      // Group by region to avoid duplicate pins
      const byRegion: Record<string, PwdMapData[]> = {}
      data.forEach((d) => {
        if (!byRegion[d.region]) byRegion[d.region] = []
        byRegion[d.region].push(d)
      })

      const bounds: [number, number][] = []

      Object.entries(byRegion).forEach(([region, items]) => {
        const coords = getCoords(region)
        const totalCount = items.reduce((sum, i) => sum + i.count, 0)
        const color = getMarkerColor(totalCount)
        const aids = [...new Set(items.map((i) => i.aid))].join(", ")
        const disabilities = [...new Set(items.map((i) => i.disability))].join(", ")

        // Create a custom circle marker
        const circleMarker = L.circleMarker(coords, {
          radius: Math.min(8 + totalCount * 0.5, 22),
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        })

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: #1a202c;">${region}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="background:${color}; color:#fff; border-radius:999px; padding:2px 10px; font-size:13px; font-weight:600;">${totalCount} PwDs</span>
            </div>
            <div style="font-size:12px; color:#4a5568; margin-top:6px;"><b>Aid Needed:</b> ${aids}</div>
            <div style="font-size:12px; color:#4a5568; margin-top:2px;"><b>Disability:</b> ${disabilities}</div>
          </div>
        `
        circleMarker.bindPopup(popupContent, { maxWidth: 260 })
        circleMarker.addTo(map)
        markersRef.current.push(circleMarker)
        bounds.push(coords)
      })

      // If a specific region is selected, fly to it
      if (selectedRegion !== "All") {
        const regionData = byRegion[selectedRegion]
        if (regionData) {
          const coords = getCoords(selectedRegion)
          map.flyTo(coords, 9, { animate: true, duration: 1 })
        }
      } else if (bounds.length > 0) {
        try {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 })
        } catch {
          map.setView([20.5937, 78.9629], 5)
        }
      }
    })
  }, [data, selectedRegion])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={mapRef}
      style={{ height: "420px", width: "100%", borderRadius: "12px", zIndex: 0 }}
    />
  )
}
