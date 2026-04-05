import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  View,
} from "react-native";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import ImagePickerField from "../../components/ImagePickerField";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest, apiRequestMultipart } from "../../lib/http";
import { useFocusEffect } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  DayOffMap,
  LocationItem,
  ScheduleDetailDay,
  ScheduleItem,
  SectionKey,
  ServiceItem,
  StaffItem,
} from "../../Global/Types/business";
import {
  DEFAULT_DAY_OFF,
  SECTION_ICONS,
  SECTION_LABELS,
} from "./business.constants";
import { styles } from "./business.styles";
import { BusinessInformationSection } from "./business-sections/BusinessInformationSection";
import { BusinessLocationsSection } from "./business-sections/BusinessLocationsSection";
import { BusinessScheduleSection } from "./business-sections/BusinessScheduleSection";
import { BusinessServicesSection } from "./business-sections/BusinessServicesSection";
import { BusinessStaffSection } from "./business-sections/BusinessStaffSection";

export default function BusinessScreen() {
  const {
    session,
    refreshSessionData,
    selectedLocation,
    selectedLocationId,
    setSelectedLocationId,
    themePreference,
    primaryColor,
  } = useAuth();
  const colorScheme = themePreference ?? "dark";
  const theme = Colors[colorScheme] ?? Colors.light;
  const [active, setActive] = useState<SectionKey>("information");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [aboutUs, setAboutUs] = useState("");

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showScheduleCreateModal, setShowScheduleCreateModal] = useState(false);
  const [showScheduleDetailsModal, setShowScheduleDetailsModal] =
    useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showServiceViewModal, setShowServiceViewModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showStaffViewModal, setShowStaffViewModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLocationViewModal, setShowLocationViewModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
    null,
  );
  const [scheduleDetails, setScheduleDetails] = useState<ScheduleDetailDay[]>(
    [],
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");

  const [scheduleStartDate, setScheduleStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [scheduleEndDate, setScheduleEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
  );
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [break1Start, setBreak1Start] = useState("");
  const [break1End, setBreak1End] = useState("");
  const [break2Start, setBreak2Start] = useState("");
  const [break2End, setBreak2End] = useState("");
  const [break3Start, setBreak3Start] = useState("");
  const [break3End, setBreak3End] = useState("");
  const [dayOffMap, setDayOffMap] = useState<DayOffMap>(DEFAULT_DAY_OFF);
  const [applyToAllStaff, setApplyToAllStaff] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingDayDetails, setSavingDayDetails] = useState(false);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("General");
  const [serviceDuration, setServiceDuration] = useState("60");
  const [servicePrice, setServicePrice] = useState("0");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceImageUrl, setServiceImageUrl] = useState("");
  const [paymentOption, setPaymentOption] = useState<
    "cash" | "card" | "cash_and_card"
  >("cash");
  const [isGroup, setIsGroup] = useState(false);
  const [capacity, setCapacity] = useState("1");
  const [selectedServiceStaffIds, setSelectedServiceStaffIds] = useState<
    string[]
  >([]);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null,
  );
  const [viewService, setViewService] = useState<ServiceItem | null>(null);

  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteStaffImageUrl, setInviteStaffImageUrl] = useState("");
  const [editingStaff, setEditingStaff] = useState<StaffItem | null>(null);
  const [viewStaff, setViewStaff] = useState<StaffItem | null>(null);

  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationPhone, setLocationPhone] = useState("");
  const [locationEmail, setLocationEmail] = useState("");
  const [locationImageUrl, setLocationImageUrl] = useState("");
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(
    null,
  );
  const [viewLocation, setViewLocation] = useState<LocationItem | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const selectedDetailDay = useMemo(() => {
    if (!selectedDateKey) return null;
    return (
      scheduleDetails.find(
        (item) => item.date.split("T")[0] === selectedDateKey,
      ) || null
    );
  }, [scheduleDetails, selectedDateKey]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    scheduleDetails.forEach((item) => {
      const key = item.date.split("T")[0];
      marks[key] = {
        marked: true,
        dotColor: item.isDayOff ? Colors.warning : primaryColor,
      };
    });

    if (selectedDateKey) {
      marks[selectedDateKey] = {
        ...(marks[selectedDateKey] || {}),
        selected: true,
        selectedColor: primaryColor,
      };
    }

    return marks;
  }, [scheduleDetails, selectedDateKey, primaryColor]);

  const loadBusinessData = useCallback(async () => {
    if (!session?.token || !session?.user?.businessId) return;

    try {
      setLoading(true);
      const locationQuery = selectedLocationId
        ? `&locationId=${selectedLocationId}`
        : "";

      const [
        business,
        fetchedLocations,
        fetchedSchedules,
        fetchedServices,
        fetchedStaff,
      ] = await Promise.all([
        apiRequest<{
          businessName?: string;
          category?: string;
          aboutUs?: string;
          phone?: string;
        }>(`/api/business/${session.user.businessId}`, {
          token: session.token,
        }),
        apiRequest<LocationItem[]>(
          `/api/locations?businessId=${session.user.businessId}`,
          { token: session.token },
        ),
        apiRequest<ScheduleItem[]>(`/api/staff-schedules`, {
          token: session.token,
        }),
        apiRequest<ServiceItem[]>(
          `/api/service?businessId=${session.user.businessId}${locationQuery}`,
          {
            token: session.token,
          },
        ),
        apiRequest<StaffItem[]>(
          `/api/staff/staff-list?businessId=${session.user.businessId}${locationQuery}`,
          {
            token: session.token,
          },
        ),
      ]);

      setBusinessName(business.businessName ?? "");
      setCategory(business.category ?? "");
      setAboutUs(business.aboutUs ?? "");
      setPhone(business.phone ?? "");
      setFirstName(session.user.firstName ?? "");
      setLastName(session.user.lastName ?? "");

      setLocations(fetchedLocations);
      setSchedules(fetchedSchedules);
      setServices(fetchedServices);
      setStaffList(fetchedStaff);
      if (!selectedLocationId && fetchedLocations[0]?._id) {
        setSelectedLocationId(fetchedLocations[0]._id);
      }
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error
          ? error.message
          : "Неуспешно зареждане на бизнес данни.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    session?.token,
    session?.user?.businessId,
    session?.user?.firstName,
    session?.user?.lastName,
    selectedLocationId,
    setSelectedLocationId,
  ]);

  useFocusEffect(
    useCallback(() => {
      void loadBusinessData();
    }, [loadBusinessData]),
  );

  const saveInformation = async () => {
    if (!session?.token || !session?.user?.id || !session?.user?.businessId)
      return;
    try {
      setSaving(true);
      await apiRequest(`/api/auth/user/${session.user.id}`, {
        token: session.token,
        method: "PUT",
        body: { firstName, lastName, phone },
      });
      await apiRequest(`/api/business/${session.user.businessId}`, {
        token: session.token,
        method: "PUT",
        body: { businessName, category, aboutUs, phone },
      });
      await refreshSessionData();
      await loadBusinessData();
      setShowInfoModal(false);
      Alert.alert("Готово", "Information е обновена.");
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Save failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const createSchedule = async () => {
    if (!session?.token || !selectedLocation?._id) {
      Alert.alert(
        "Няма локация",
        "Добави локация чрез onboarding преди график.",
      );
      return;
    }

    if (!scheduleStartDate || !scheduleEndDate || !workStart || !workEnd) {
      Alert.alert("Липсват данни", "Попълни period и work time.");
      return;
    }

    try {
      setSavingSchedule(true);

      const payload: Record<string, unknown> = {
        locationId: selectedLocation._id,
        startDate: scheduleStartDate,
        endDate: scheduleEndDate,
        workTime: { start: workStart, end: workEnd },
        isDayOff: dayOffMap,
      };

      if (break1Start && break1End) {
        payload.break1 = { start: break1Start, end: break1End };
      }
      if (break2Start && break2End) {
        payload.break2 = { start: break2Start, end: break2End };
      }
      if (break3Start && break3End) {
        payload.break3 = { start: break3Start, end: break3End };
      }

      const created = await apiRequest<ScheduleItem>(`/api/staff-schedules`, {
        token: session.token,
        method: "POST",
        body: payload,
      });

      if (applyToAllStaff && created?._id) {
        await apiRequest(`/api/staff-schedules/apply-to-all`, {
          token: session.token,
          method: "POST",
          body: { scheduleId: created._id },
        });
      }

      setShowScheduleCreateModal(false);
      await loadBusinessData();
      Alert.alert("Готово", "Графикът е създаден.");
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Create failed",
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const openScheduleDetails = async (schedule: ScheduleItem) => {
    if (!session?.token) return;

    try {
      setSavingDayDetails(true);
      setSelectedSchedule(schedule);
      setShowScheduleDetailsModal(true);

      const details = await apiRequest<ScheduleDetailDay[]>(
        `/api/staff-schedules/${schedule._id}/details`,
        {
          token: session.token,
        },
      );

      setScheduleDetails(details);

      if (details[0]?.date) {
        setSelectedDateKey(details[0].date.split("T")[0]);
      }
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error
          ? error.message
          : "Неуспешно зареждане на дневен график.",
      );
      setShowScheduleDetailsModal(false);
    } finally {
      setSavingDayDetails(false);
    }
  };

  const updateSelectedDay = (patch: Partial<ScheduleDetailDay>) => {
    if (!selectedDetailDay) return;

    setScheduleDetails((previous) =>
      previous.map((item) =>
        item._id === selectedDetailDay._id
          ? {
              ...item,
              ...patch,
            }
          : item,
      ),
    );
  };

  const saveDayDetails = async () => {
    if (!session?.token || !selectedSchedule?._id) return;

    try {
      setSavingDayDetails(true);

      const payload = scheduleDetails.map((item) => ({
        ...item,
        date: new Date(item.date).toISOString(),
      }));

      await apiRequest(`/api/staff-schedules/${selectedSchedule._id}/details`, {
        token: session.token,
        method: "PUT",
        body: { workHours: payload },
      });

      await loadBusinessData();
      Alert.alert("Готово", "Дневният график е запазен.");
      setShowScheduleDetailsModal(false);
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Save failed",
      );
    } finally {
      setSavingDayDetails(false);
    }
  };

  const openLocationModal = (location?: LocationItem) => {
    if (location) {
      setEditingLocation(location);
      setLocationName(location.name ?? "");
      setLocationAddress(location.address ?? "");
      setLocationCity(location.city ?? "");
      setLocationPhone(location.phone ?? "");
      setLocationEmail(location.email ?? "");
      setLocationImageUrl(location.imageUrl ?? "");
    } else {
      setEditingLocation(null);
      setLocationName("");
      setLocationAddress("");
      setLocationCity("");
      setLocationPhone("");
      setLocationEmail("");
      setLocationImageUrl("");
    }
    setShowLocationModal(true);
  };

  const saveLocation = async () => {
    if (!session?.token) return;
    if (
      !locationName.trim() ||
      !locationAddress.trim() ||
      !locationCity.trim()
    ) {
      Alert.alert("Липсват данни", "Попълни име, адрес и град.");
      return;
    }

    try {
      setSaving(true);
      const endpoint = editingLocation
        ? `/api/locations/${editingLocation._id}`
        : `/api/locations`;
      const method = editingLocation ? "PUT" : ("POST" as "PUT" | "POST");
      const locationPayload = {
        name: locationName.trim(),
        address: locationAddress.trim(),
        city: locationCity.trim(),
        phone: locationPhone.trim(),
        email: locationEmail.trim(),
        country: "България",
      };

      if (locationImageUrl.startsWith("file://")) {
        setUploadingImage(true);
        await apiRequestMultipart(endpoint, locationImageUrl, locationPayload, {
          token: session.token,
          method,
        });
        setUploadingImage(false);
      } else {
        await apiRequest(endpoint, {
          token: session.token,
          method,
          body: {
            ...locationPayload,
            imageUrl: locationImageUrl.trim(),
          },
        });
      }
      setShowLocationModal(false);
      await loadBusinessData();
      Alert.alert(
        "Готово",
        editingLocation ? "Локацията е обновена." : "Локацията е създадена.",
      );
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Save location failed",
      );
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const openServiceModal = (service?: ServiceItem) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.name ?? "");
      setServiceCategory(service.category ?? "General");
      setServiceDuration(String(service.duration ?? 60));
      setServicePrice(String(service.price ?? 0));
      setServiceDescription(service.description ?? "");
      setServiceImageUrl(service.imageUrl ?? "");
      setPaymentOption(service.paymentOption ?? "cash");
      setIsGroup(!!service.isGroup);
      setCapacity(String(service.capacity ?? 1));
      const resolvedStaffIds = (service.staffMembers ?? [])
        .map((staffMember) =>
          typeof staffMember === "string" ? staffMember : staffMember?._id,
        )
        .filter((staffId): staffId is string => !!staffId);
      setSelectedServiceStaffIds(resolvedStaffIds);
    } else {
      setEditingService(null);
      setServiceName("");
      setServiceCategory("General");
      setServiceDuration("60");
      setServicePrice("0");
      setServiceDescription("");
      setServiceImageUrl("");
      setPaymentOption("cash");
      setIsGroup(false);
      setCapacity("1");
      setSelectedServiceStaffIds([]);
    }
    setShowServiceModal(true);
  };

  const saveService = async () => {
    if (!session?.token) return;
    if (!serviceName.trim()) {
      Alert.alert("Липсва име", "Добави име на услуга.");
      return;
    }
    if (selectedServiceStaffIds.length === 0) {
      Alert.alert(
        "Липсва служител",
        "Избери поне един служител за тази услуга.",
      );
      return;
    }
    try {
      setSaving(true);
      const endpoint = editingService
        ? `/api/service/${editingService._id}`
        : `/api/service`;
      const method = editingService ? "PUT" : ("POST" as "PUT" | "POST");
      const servicePayload = {
        name: serviceName.trim(),
        category: serviceCategory.trim(),
        duration: String(Number(serviceDuration) || 60),
        price: String(Number(servicePrice) || 0),
        description: serviceDescription.trim(),
        paymentOption,
        isGroup: String(isGroup),
        capacity: String(Number(capacity) || 1),
        staffMembers: JSON.stringify(selectedServiceStaffIds),
        ...(selectedLocation?._id ? { locationId: selectedLocation._id } : {}),
      };

      if (serviceImageUrl.startsWith("file://")) {
        setUploadingImage(true);
        await apiRequestMultipart(endpoint, serviceImageUrl, servicePayload, {
          token: session.token,
          method,
        });
        setUploadingImage(false);
      } else {
        await apiRequest(endpoint, {
          token: session.token,
          method,
          body: {
            ...servicePayload,
            duration: Number(servicePayload.duration),
            price: Number(servicePayload.price),
            isGroup,
            capacity: Number(servicePayload.capacity),
            imageUrl: serviceImageUrl.trim(),
            staffMembers: selectedServiceStaffIds,
          },
        });
      }
      setServiceName("");
      setServiceCategory("General");
      setServiceDuration("60");
      setServicePrice("0");
      setServiceDescription("");
      setServiceImageUrl("");
      setPaymentOption("cash");
      setIsGroup(false);
      setCapacity("1");
      setSelectedServiceStaffIds([]);
      setEditingService(null);
      setShowServiceModal(false);
      await loadBusinessData();
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Create failed",
      );
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const confirmDeleteService = (service: ServiceItem) => {
    Alert.alert(
      "Изтрий услуга",
      `Сигурен ли си, че искаш да изтриеш „${service.name}"?`,
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Изтрий",
          style: "destructive",
          onPress: () => void deleteService(service._id),
        },
      ],
    );
  };

  const deleteService = async (serviceId: string) => {
    if (!session?.token) return;
    try {
      await apiRequest(`/api/service/${serviceId}`, {
        token: session.token,
        method: "DELETE",
      });
      await loadBusinessData();
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Delete failed",
      );
    }
  };

  const confirmRemoveStaff = (staff: StaffItem) => {
    const name =
      [staff.firstName, staff.lastName].filter(Boolean).join(" ") ||
      staff.email;
    Alert.alert(
      "Премахни служител",
      `Сигурен ли си, че искаш да премахнеш ${name}?`,
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Премахни",
          style: "destructive",
          onPress: () => void removeStaff(staff._id),
        },
      ],
    );
  };

  const removeStaff = async (staffId: string) => {
    if (!session?.token) return;
    try {
      await apiRequest(`/api/staff/${staffId}`, {
        token: session.token,
        method: "DELETE",
      });
      await loadBusinessData();
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Remove failed",
      );
    }
  };

  const confirmDeleteLocation = (location: LocationItem) => {
    Alert.alert(
      "Изтрий локация",
      `Сигурен ли си, че искаш да изтриеш „${location.name}"?`,
      [
        { text: "Отказ", style: "cancel" },
        {
          text: "Изтрий",
          style: "destructive",
          onPress: () => void deleteLocation(location._id),
        },
      ],
    );
  };

  const deleteLocation = async (locationId: string) => {
    if (!session?.token) return;
    try {
      await apiRequest(`/api/locations/${locationId}`, {
        token: session.token,
        method: "DELETE",
      });
      await loadBusinessData();
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Delete failed",
      );
    }
  };

  const openStaffModal = (staff?: StaffItem) => {
    if (staff) {
      setEditingStaff(staff);
      setInviteEmail(staff.email ?? "");
      setInviteFirstName(staff.firstName ?? "");
      setInviteLastName(staff.lastName ?? "");
      setInvitePhone(staff.phone ?? "");
      setInviteStaffImageUrl(staff.profilePictureUrl ?? "");
    } else {
      setEditingStaff(null);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInvitePhone("");
      setInviteStaffImageUrl("");
    }
    setShowStaffModal(true);
  };

  const saveStaff = async () => {
    if (!session?.token) return;
    if (!inviteEmail.trim()) {
      Alert.alert("Липсва имейл", "Въведи имейл на служителя.");
      return;
    }
    if (
      !inviteFirstName.trim() ||
      !inviteLastName.trim() ||
      !invitePhone.trim()
    ) {
      Alert.alert("Липсват данни", "Име, фамилия и телефон са задължителни.");
      return;
    }
    try {
      setSaving(true);
      if (editingStaff) {
        await apiRequest(`/api/staff/${editingStaff._id}`, {
          token: session.token,
          method: "PUT",
          body: {
            email: inviteEmail.trim().toLowerCase(),
            firstName: inviteFirstName.trim() || "Staff",
            lastName: inviteLastName.trim() || "Member",
            phone: invitePhone.trim(),
            ...(selectedLocation?._id
              ? { locationIds: [selectedLocation._id] }
              : {}),
          },
        });

        if (inviteStaffImageUrl.startsWith("file://")) {
          setUploadingImage(true);
          await apiRequestMultipart(
            `/api/auth/user/${editingStaff._id}/picture`,
            inviteStaffImageUrl,
            {},
            {
              token: session.token,
              method: "PUT",
              fileFieldName: "profilePicture",
            },
          );
          setUploadingImage(false);
        }
      } else {
        const created = await apiRequest<{ staff?: { _id: string } }>(
          `/api/staff/invite`,
          {
            token: session.token,
            method: "POST",
            body: {
              email: inviteEmail.trim().toLowerCase(),
              firstName: inviteFirstName.trim(),
              lastName: inviteLastName.trim(),
              phone: invitePhone.trim(),
              ...(selectedLocation?._id
                ? { locationId: selectedLocation._id }
                : {}),
            },
          },
        );

        const createdStaffId = created?.staff?._id;
        if (createdStaffId && inviteStaffImageUrl.startsWith("file://")) {
          setUploadingImage(true);
          await apiRequestMultipart(
            `/api/auth/user/${createdStaffId}/picture`,
            inviteStaffImageUrl,
            {},
            {
              token: session.token,
              method: "PUT",
              fileFieldName: "profilePicture",
            },
          );
          setUploadingImage(false);
        }
      }
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInvitePhone("");
      setInviteStaffImageUrl("");
      setEditingStaff(null);
      setShowStaffModal(false);
      await loadBusinessData();
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error ? error.message : "Invite failed",
      );
    } finally {
      setUploadingImage(false);
      setSaving(false);
    }
  };

  const renderSection = () => {
    if (active === "information") {
      return (
        <BusinessInformationSection
          context={{
            businessName,
            category,
            phone,
            aboutUs,
            openActionMenu,
            setOpenActionMenu,
            setShowInfoModal,
            theme,
            primaryColor,
          }}
        />
      );
    }

    if (active === "locations") {
      return (
        <BusinessLocationsSection
          context={{
            openLocationModal,
            locations,
            theme,
            primaryColor,
            openActionMenu,
            setOpenActionMenu,
            setViewLocation,
            setShowLocationViewModal,
            confirmDeleteLocation,
          }}
        />
      );
    }

    if (active === "schedule") {
      return (
        <BusinessScheduleSection
          context={{
            selectedLocation,
            setShowScheduleCreateModal,
            schedules,
            theme,
            primaryColor,
            openScheduleDetails,
            showScheduleCreateModal,
            scheduleStartDate,
            setScheduleStartDate,
            scheduleEndDate,
            setScheduleEndDate,
            workStart,
            setWorkStart,
            workEnd,
            setWorkEnd,
            break1Start,
            setBreak1Start,
            break1End,
            setBreak1End,
            break2Start,
            setBreak2Start,
            break2End,
            setBreak2End,
            break3Start,
            setBreak3Start,
            break3End,
            setBreak3End,
            dayOffMap,
            setDayOffMap,
            applyToAllStaff,
            setApplyToAllStaff,
            createSchedule,
            savingSchedule,
            showScheduleDetailsModal,
            savingDayDetails,
            scheduleDetails,
            markedDates,
            setSelectedDateKey,
            selectedDetailDay,
            selectedDateKey,
            updateSelectedDay,
            saveDayDetails,
            setShowScheduleDetailsModal,
          }}
        />
      );
    }

    if (active === "services") {
      return (
        <BusinessServicesSection
          context={{
            openServiceModal,
            services,
            theme,
            primaryColor,
            openActionMenu,
            setOpenActionMenu,
            setViewService,
            setShowServiceViewModal,
            confirmDeleteService,
          }}
        />
      );
    }

    return (
      <BusinessStaffSection
        context={{
          openStaffModal,
          staffList,
          theme,
          primaryColor,
          openActionMenu,
          setOpenActionMenu,
          setViewStaff,
          setShowStaffViewModal,
          confirmRemoveStaff,
        }}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {renderSection()}
        </ScrollView>
      )}

      <View
        style={[
          styles.subTabsRow,
          {
            backgroundColor: theme.navBackground,
          },
        ]}
      >
        {(Object.keys(SECTION_LABELS) as SectionKey[])
          .filter((key) => key !== "locations")
          .map((key) => {
            const focused = active === key;

            return (
              <ThemedButton
                key={key}
                style={[
                  styles.subTabButton,
                  {
                    backgroundColor: focused
                      ? theme.uiBackground
                      : theme.background,
                  },
                ]}
                onPress={() => setActive(key)}
              >
                <Ionicons
                  size={16}
                  name={SECTION_ICONS[key]}
                  color={focused ? theme.iconColorFocused : theme.iconColor}
                />
                <ThemedText
                  style={[
                    styles.subTabText,
                    {
                      color: focused ? theme.iconColorFocused : theme.iconColor,
                    },
                  ]}
                >
                  {SECTION_LABELS[key]}
                </ThemedText>
              </ThemedButton>
            );
          })}
      </View>

      <Modal visible={showInfoModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              Edit information
            </ThemedText>
            <ScrollView>
              <ThemedText style={styles.label}>First Name</ThemedText>
              <ThemedTextInput value={firstName} onChangeText={setFirstName} />
              <ThemedText style={styles.label}>Last Name</ThemedText>
              <ThemedTextInput value={lastName} onChangeText={setLastName} />
              <ThemedText style={styles.label}>Business Name</ThemedText>
              <ThemedTextInput
                value={businessName}
                onChangeText={setBusinessName}
              />
              <ThemedText style={styles.label}>Category</ThemedText>
              <ThemedTextInput value={category} onChangeText={setCategory} />
              <ThemedText style={styles.label}>Phone</ThemedText>
              <ThemedTextInput value={phone} onChangeText={setPhone} />
              <ThemedText style={styles.label}>About</ThemedText>
              <ThemedTextInput
                value={aboutUs}
                onChangeText={setAboutUs}
                multiline
                numberOfLines={3}
                style={styles.multiline}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => setShowInfoModal(false)}
              >
                <ThemedText style={styles.btnText}>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => void saveInformation()}
                disabled={saving}
              >
                <ThemedText style={styles.btnText}>
                  {saving ? "Saving..." : "Save"}
                </ThemedText>
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showServiceModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              {editingService ? "Edit service" : "Add service"}
            </ThemedText>
            <ScrollView>
              <ThemedText style={styles.label}>Service Name</ThemedText>
              <ThemedTextInput
                value={serviceName}
                onChangeText={setServiceName}
              />
              <ThemedText style={styles.label}>Category</ThemedText>
              <ThemedTextInput
                value={serviceCategory}
                onChangeText={setServiceCategory}
              />
              <ThemedText style={styles.label}>Duration</ThemedText>
              <ThemedTextInput
                value={serviceDuration}
                onChangeText={setServiceDuration}
                keyboardType="numeric"
              />
              <ThemedText style={styles.label}>Price</ThemedText>
              <ThemedTextInput
                value={servicePrice}
                onChangeText={setServicePrice}
                keyboardType="numeric"
              />
              <ThemedText style={styles.label}>Description</ThemedText>
              <ThemedTextInput
                value={serviceDescription}
                onChangeText={setServiceDescription}
              />
              <ImagePickerField
                label="Image"
                value={serviceImageUrl}
                onChange={setServiceImageUrl}
                uploading={uploadingImage}
              />

              <ThemedText style={styles.label}>Payment Option</ThemedText>
              <View style={styles.inlineOptions}>
                {(["cash", "card", "cash_and_card"] as const).map((option) => (
                  <Pressable
                    key={option}
                    style={[
                      styles.optionChip,
                      paymentOption === option && [
                        styles.optionChipActive,
                        { backgroundColor: primaryColor },
                      ],
                    ]}
                    onPress={() => setPaymentOption(option)}
                  >
                    <ThemedText style={styles.optionChipText}>
                      {option}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <View style={styles.switchRow}>
                <ThemedText>Group service</ThemedText>
                <Switch value={isGroup} onValueChange={setIsGroup} />
              </View>

              <ThemedText style={styles.label}>Capacity</ThemedText>
              <ThemedTextInput
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
              />

              <ThemedText style={styles.label}>
                Assigned staff (required)
              </ThemedText>
              <View style={styles.inlineOptions}>
                {staffList.length === 0 ? (
                  <ThemedText style={styles.emptyHint}>
                    Първо покани staff в Staff таба.
                  </ThemedText>
                ) : (
                  staffList.map((staff) => {
                    const selected = selectedServiceStaffIds.includes(
                      staff._id,
                    );
                    const label =
                      [staff.firstName, staff.lastName]
                        .filter(Boolean)
                        .join(" ") || staff.email;
                    return (
                      <Pressable
                        key={staff._id}
                        style={[
                          styles.optionChip,
                          selected && [
                            styles.optionChipActive,
                            { backgroundColor: primaryColor },
                          ],
                          styles.staffChip,
                        ]}
                        onPress={() => {
                          setSelectedServiceStaffIds((previous) =>
                            previous.includes(staff._id)
                              ? previous.filter((id) => id !== staff._id)
                              : [...previous, staff._id],
                          );
                        }}
                      >
                        <ThemedText style={styles.optionChipText}>
                          {label}
                        </ThemedText>
                      </Pressable>
                    );
                  })
                )}
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => setShowServiceModal(false)}
              >
                <ThemedText style={styles.btnText}>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => void saveService()}
                disabled={saving}
              >
                <ThemedText style={styles.btnText}>
                  {saving ? "Saving..." : "Save"}
                </ThemedText>
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showStaffModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              {editingStaff ? "Edit staff" : "Invite staff"}
            </ThemedText>
            <ScrollView>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedTextInput
                value={inviteEmail}
                onChangeText={setInviteEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <ThemedText style={styles.label}>First name</ThemedText>
              <ThemedTextInput
                value={inviteFirstName}
                onChangeText={setInviteFirstName}
              />
              <ThemedText style={styles.label}>Last name</ThemedText>
              <ThemedTextInput
                value={inviteLastName}
                onChangeText={setInviteLastName}
              />
              <ThemedText style={styles.label}>Phone</ThemedText>
              <ThemedTextInput
                value={invitePhone}
                onChangeText={setInvitePhone}
                keyboardType="phone-pad"
              />
              <ImagePickerField
                label="Staff image (optional)"
                value={inviteStaffImageUrl}
                onChange={setInviteStaffImageUrl}
                uploading={uploadingImage}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => setShowStaffModal(false)}
              >
                <ThemedText style={styles.btnText}>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => void saveStaff()}
                disabled={saving}
              >
                <ThemedText style={styles.btnText}>
                  {saving ? "Sending..." : "Invite"}
                </ThemedText>
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showLocationModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              {editingLocation ? "Edit location" : "Add location"}
            </ThemedText>
            <ScrollView>
              <ThemedText style={styles.label}>Name</ThemedText>
              <ThemedTextInput
                value={locationName}
                onChangeText={setLocationName}
              />
              <ThemedText style={styles.label}>Address</ThemedText>
              <ThemedTextInput
                value={locationAddress}
                onChangeText={setLocationAddress}
              />
              <ThemedText style={styles.label}>City</ThemedText>
              <ThemedTextInput
                value={locationCity}
                onChangeText={setLocationCity}
              />
              <ThemedText style={styles.label}>Phone</ThemedText>
              <ThemedTextInput
                value={locationPhone}
                onChangeText={setLocationPhone}
              />
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedTextInput
                value={locationEmail}
                onChangeText={setLocationEmail}
              />
              <ImagePickerField
                label="Image"
                value={locationImageUrl}
                onChange={setLocationImageUrl}
                uploading={uploadingImage}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => setShowLocationModal(false)}
              >
                <ThemedText style={styles.btnText}>Cancel</ThemedText>
              </ThemedButton>
              <ThemedButton
                style={styles.smallBtn}
                onPress={() => void saveLocation()}
                disabled={saving}
              >
                <ThemedText style={styles.btnText}>
                  {saving ? "Saving..." : "Save"}
                </ThemedText>
              </ThemedButton>
            </View>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showServiceViewModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              Service details
            </ThemedText>
            {viewService ? (
              <ScrollView>
                {!!viewService.imageUrl && (
                  <Image
                    source={{ uri: viewService.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                <ThemedText style={styles.detailLine}>
                  Name: {viewService.name}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Category: {viewService.category}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Duration: {viewService.duration} min
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Price: {viewService.price} лв
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Payment: {viewService.paymentOption || "cash"}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Group: {viewService.isGroup ? "Yes" : "No"}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Capacity: {viewService.capacity || 1}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Assigned staff: {(viewService.staffMembers ?? []).length}
                </ThemedText>
                {!!viewService.description && (
                  <ThemedText style={styles.detailLine}>
                    Description: {viewService.description}
                  </ThemedText>
                )}
              </ScrollView>
            ) : null}
            <ThemedButton
              style={styles.smallBtn}
              onPress={() => setShowServiceViewModal(false)}
            >
              <ThemedText style={styles.btnText}>Close</ThemedText>
            </ThemedButton>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showStaffViewModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              Staff details
            </ThemedText>
            {viewStaff ? (
              <ScrollView>
                {!!viewStaff.profilePictureUrl && (
                  <Image
                    source={{ uri: viewStaff.profilePictureUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                <ThemedText style={styles.detailLine}>
                  Name:{" "}
                  {[viewStaff.firstName, viewStaff.lastName]
                    .filter(Boolean)
                    .join(" ") || "Unnamed"}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Email: {viewStaff.email}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Phone: {viewStaff.phone || "-"}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Role: {viewStaff.role}
                </ThemedText>
              </ScrollView>
            ) : null}
            <ThemedButton
              style={styles.smallBtn}
              onPress={() => setShowStaffViewModal(false)}
            >
              <ThemedText style={styles.btnText}>Close</ThemedText>
            </ThemedButton>
          </ThemedView>
        </View>
      </Modal>

      <Modal visible={showLocationViewModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.modalCard}>
            <ThemedText title={true} style={styles.modalTitle}>
              Location details
            </ThemedText>
            {viewLocation ? (
              <ScrollView>
                {!!viewLocation.imageUrl && (
                  <Image
                    source={{ uri: viewLocation.imageUrl }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                )}
                <ThemedText style={styles.detailLine}>
                  Name: {viewLocation.name}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  Address: {viewLocation.address || "-"}
                </ThemedText>
                <ThemedText style={styles.detailLine}>
                  City: {viewLocation.city || "-"}
                </ThemedText>
                {!!viewLocation.phone && (
                  <ThemedText style={styles.detailLine}>
                    Phone: {viewLocation.phone}
                  </ThemedText>
                )}
                {!!viewLocation.email && (
                  <ThemedText style={styles.detailLine}>
                    Email: {viewLocation.email}
                  </ThemedText>
                )}
              </ScrollView>
            ) : null}
            <ThemedButton
              style={styles.smallBtn}
              onPress={() => setShowLocationViewModal(false)}
            >
              <ThemedText style={styles.btnText}>Close</ThemedText>
            </ThemedButton>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}
