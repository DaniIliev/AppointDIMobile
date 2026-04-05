import { Ionicons } from "@expo/vector-icons";
import { DayOffMap, SectionKey } from "../../Global/Types/business";

export const DEFAULT_DAY_OFF: DayOffMap = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: true,
  sunday: true,
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  information: "Information",
  locations: "Locations",
  schedule: "Schedule",
  services: "Services",
  staff: "Staff",
};

export const SECTION_ICONS: Record<SectionKey, keyof typeof Ionicons.glyphMap> =
  {
    information: "information-circle-outline",
    locations: "location-outline",
    schedule: "time-outline",
    services: "construct-outline",
    staff: "people-outline",
  };
