export type Location = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

export const locations: Location[] = [
  {
    name: "Louvre Museum",
    address: "Rue de Rivoli, 75001 Paris, France",
    lat: 48.8606,
    lng: 2.3376,
  },
  {
    name: "Eiffel Tower",
    address: "Champ de Mars, 5 Av. Anatole France, 75007 Paris, France",
    lat: 48.8584,
    lng: 2.2945,
  },
  {
    name: "Gare du Nord",
    address: "18 Rue de Dunkerque, 75010 Paris, France",
    lat: 48.8809,
    lng: 2.3553,
  },
  {
    name: "La Défense",
    address: "1 Parvis de la Défense, 92800 Puteaux, France",
    lat: 48.892,
    lng: 2.237,
  },
  {
    name: "Charles de Gaulle Airport",
    address: "95700 Roissy-en-France, France",
    lat: 49.0097,
    lng: 2.5479,
  },
  {
    name: "Place des Vosges, Le Marais",
    address: "Place des Vosges, 75004 Paris, France",
    lat: 48.8556,
    lng: 2.3655,
  },
  {
    name: "Opéra Garnier",
    address: "Place de l'Opéra, 75009 Paris, France",
    lat: 48.8719,
    lng: 2.3322,
  },
  {
    name: "Place du Tertre, Montmartre",
    address: "Place du Tertre, 75018 Paris, France",
    lat: 48.8865,
    lng: 2.3406,
  },
  {
    name: "Arc de Triomphe",
    address: "Place Charles de Gaulle, 75008 Paris, France",
    lat: 48.8738,
    lng: 2.2950
  }
];

export const locationMap = new Map(locations.map(l => [l.address, { lat: l.lat, lng: l.lng }]));
