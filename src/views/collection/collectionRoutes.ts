import { PLATFORM } from "aurelia-pal";

export const routes = [
  {
    route: ["", "collection-overview"],
    name: "collection_overview",
    moduleId: PLATFORM.moduleName(
      "./collection-overview/collection-overview",
      "collection-overview",
    ),
    nav: false,
    title: "Collections",
    settings: {
      auth: true,
    },
  },
  {
    route: [":collectionId"],
    name: "collection-details",
    moduleId: PLATFORM.moduleName("./collection-details/collection-details", "collection-details"),
    nav: true,
    title: "Overview",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/devices"],
    name: "collection-devices",
    moduleId: PLATFORM.moduleName("./collection-devices/collection-devices", "collection-devices"),
    nav: true,
    title: "Devices",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/outputs"],
    name: "collection-outputs",
    moduleId: PLATFORM.moduleName("./collection-outputs/collection-outputs", "collection-outputs"),
    nav: true,
    title: "Outputs",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/visualization"],
    name: "collection-visualization",
    moduleId: PLATFORM.moduleName(
      "./collection-visualization/collection-visualization",
      "collection-visualization",
    ),
    nav: true,
    title: "Visualization",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/firmware"],
    name: "collection-firmware",
    moduleId: PLATFORM.moduleName(
      "./collection-firmware/collection-firmware",
      "collection-firmware",
    ),
    nav: true,
    title: "Firmware",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/firmware/:firmwareImageId"],
    name: "firmware-details",
    moduleId: PLATFORM.moduleName(
      "../firmware/firmware-details/firmware-details",
      "firmware-details",
    ),
    nav: false,
    title: "Firmware details",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/devices/:deviceId"],
    name: "device-details",
    moduleId: PLATFORM.moduleName("../device/device-details/device-details", "device-details"),
    nav: false,
    title: "Device details",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/devices/:deviceId/live"],
    name: "device-live-stream",
    moduleId: PLATFORM.moduleName(
      "../device/device-live-stream/device-live-stream",
      "device-stream",
    ),
    nav: false,
    title: "Device live stream",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/devices/:deviceId/data"],
    name: "device-data",
    moduleId: PLATFORM.moduleName("../device/device-data/device-data", "device-data"),
    nav: false,
    title: "Device data",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
  {
    route: [":collectionId/devices/:deviceId/firmware"],
    name: "device-firmware",
    moduleId: PLATFORM.moduleName("../device/device-firmware/device-firmware", "device-firmware"),
    nav: false,
    title: "Device firmware",
    settings: {
      auth: true,
    },
    href: "collection-overview",
  },
];
