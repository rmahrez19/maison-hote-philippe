export type RoomId = "rive-gauche" | "rive-droite";

export interface RoomDefinition {
  id: RoomId;
  name: string;
  subtitle: string;
  bed: string;
  bathroom: string;
  photo: string;
  equipments: string[];
  /** Tarif nuit, fixe quel que soit le jour de la semaine. */
  price: number;
}

/**
 * Source unique de vérité pour les deux chambres, chacune listée
 * séparément sur Booking.com avec son propre flux iCal et sa propre
 * tarification. Consommée à la fois par le frontend (sélection,
 * calendrier tarifé) et les routes API (sync, export, réservation).
 */
export const ROOMS: Record<RoomId, RoomDefinition> = {
  "rive-gauche": {
    id: "rive-gauche",
    name: "La Chambre Rive Gauche",
    subtitle: "Chambre Standard — salle de bains partagée",
    bed: "Lit double de 160",
    bathroom: "Salle de bains partagée",
    photo: "/photos/chambre-2.jpg",
    equipments: [
      "Vue sur la Seine",
      "Lit double de 160",
      "Accès au salon et à la terrasse commune",
      "Wi-Fi gratuit",
      "Petit-déjeuner continental inclus",
    ],
    price: 150,
  },
  "rive-droite": {
    id: "rive-droite",
    name: "La Chambre Rive Droite",
    subtitle: "Chambre Privative — salle de bains privée",
    bed: "Lit King Size de 180",
    bathroom: "Salle de bains privative attenante",
    photo: "/photos/chambre-1.jpg",
    equipments: [
      "Vue panoramique sur la Seine",
      "Lit King Size de 180",
      "Salle de bains privative attenante",
      "Accès au salon et à la terrasse",
      "Wi-Fi gratuit",
      "Petit-déjeuner continental inclus",
    ],
    price: 150,
  },
};

export const ROOM_LIST: RoomDefinition[] = Object.values(ROOMS);

export function isRoomId(value: string | null | undefined): value is RoomId {
  return value === "rive-gauche" || value === "rive-droite";
}
