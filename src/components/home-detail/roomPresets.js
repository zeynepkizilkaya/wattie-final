export const CAMERA_PRESETS = {
  kitchen: {
    cameraPosition: [-0.9, 0.4, 2.5],
    targetPosition: [-1.45, -0.4, 0.3],
    cameraFov: 36,
  },
  laundry: {
    cameraPosition: [2.6, 0.8, -2.0],
    targetPosition: [1.0, -0.6, -1.0],
    cameraFov: 36,
  },
  living_room: {
    cameraPosition: [2.15, 0.28, 2.25],
    targetPosition: [-0.22, -0.58, 0.48],
    cameraFov: 38,
  },
  office: {
    cameraPosition: [0.48, 1.28, -2.75],
    targetPosition: [0.18, -0.38, -0.98],
    cameraFov: 35,
  },
  climate: {
    cameraPosition: [3.75, 2.15, 3.75],
    targetPosition: [0.0, -0.22, 0.0],
    cameraFov: 40,
  },
  whole_house: {
    cameraPosition: [0.01, 10.5, 9.5],
    targetPosition: [0.0, -1.2, 0.0],
    cameraFov: 40,
  },
};

export const DEVICES_CONFIG = [
  {
    id: "refrigerator",
    name: "Buzdolabı",
    room: "Mutfak",
    cameraPresetId: "kitchen",
    iconName: "Refrigerator",
  },
  {
    id: "computer",
    name: "Bilgisayar",
    room: "Çalışma Odası",
    cameraPresetId: "office",
    iconName: "Monitor",
  },
  {
    id: "television",
    name: "Televizyon",
    room: "Salon",
    cameraPresetId: "living_room",
    iconName: "Tv",
  },
  {
    id: "oven",
    name: "Fırın & Ocak",
    room: "Mutfak",
    cameraPresetId: "kitchen",
    iconName: "Flame",
  },
  {
    id: "lights",
    name: "Genel Aydınlatma",
    room: "Salon",
    cameraPresetId: "living_room",
    iconName: "Lightbulb",
  },
];
