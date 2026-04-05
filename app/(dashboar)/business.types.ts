export type SectionKey =
  | "information"
  | "locations"
  | "schedule"
  | "services"
  | "staff";

export type TimeRange = {
  start: string;
  end: string;
};

export type DayOffMap = {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
};

export type ScheduleItem = {
  _id: string;
  startDate: string;
  endDate: string;
  workTime?: { start?: string; end?: string };
  isDayOff?: DayOffMap;
  break1?: TimeRange | null;
  break2?: TimeRange | null;
  break3?: TimeRange | null;
  location?: { _id?: string; name?: string } | string;
};

export type ScheduleDetailDay = {
  _id: string;
  day: keyof DayOffMap | string;
  date: string;
  isDayOff: boolean;
  workTime: TimeRange | null;
  breaks: TimeRange[];
};

export type LocationItem = {
  _id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
};

export type ServiceItem = {
  _id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description?: string;
  imageUrl?: string;
  paymentOption?: "cash" | "card" | "cash_and_card";
  isGroup?: boolean;
  capacity?: number;
  locationId?: string;
  staffMembers?: Array<
    | string
    | { _id: string; firstName?: string; lastName?: string; email?: string }
  >;
};

export type StaffItem = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string;
  profilePictureUrl?: string;
  locationIds?: string[];
};
