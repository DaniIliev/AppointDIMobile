import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Redirect, router } from "expo-router";
import ThemedView from "../../components/ThemendView";
import ThemedText from "../../components/ThemedText";
import ThemedTextInput from "../../components/ThemedTextInput";
import ThemedButton from "../../components/ThemedButton";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../hooks/useAuth";
import { apiRequest } from "../../lib/http";

type NewLocation = {
  _id: string;
  name: string;
};

const STEPS = ["Business", "Location", "Schedule", "Service", "Staff"];

export default function OnboardingScreen() {
  const {
    loading,
    isAuthenticated,
    needsOnboarding,
    session,
    refreshSessionData,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState<NewLocation | null>(null);

  const [businessName, setBusinessName] = useState(
    session?.business?.businessName === "Pending Setup"
      ? ""
      : (session?.business?.businessName ?? ""),
  );
  const [businessCategory, setBusinessCategory] = useState(
    session?.business?.category ?? "",
  );
  const [businessAbout, setBusinessAbout] = useState(
    session?.business?.aboutUs ?? "",
  );
  const [businessPhone, setBusinessPhone] = useState(
    session?.business?.phone ?? "",
  );

  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationCity, setLocationCity] = useState("");

  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("18:00");

  const [serviceName, setServiceName] = useState("Консултация");
  const [serviceCategory, setServiceCategory] = useState("General");
  const [serviceDuration, setServiceDuration] = useState("60");
  const [servicePrice, setServicePrice] = useState("50");

  const [staffEmail, setStaffEmail] = useState("");
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");

  const canGoBack = currentStep > 1;
  const progress = useMemo(
    () => (currentStep / STEPS.length) * 100,
    [currentStep],
  );

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!needsOnboarding) {
    return <Redirect href="/(dashboar)/dashboard" />;
  }

  const token = session?.token;
  const businessId = session?.user?.businessId;

  if (!token || !businessId) {
    return <Redirect href="/(auth)/login" />;
  }

  const saveBusiness = async () => {
    if (!businessName.trim()) {
      Alert.alert("Липсва име", "Въведи име на бизнеса.");
      return;
    }

    await apiRequest(`/api/business/${businessId}`, {
      token,
      method: "PUT",
      body: {
        businessName: businessName.trim(),
        category: businessCategory.trim(),
        aboutUs: businessAbout.trim(),
        phone: businessPhone.trim(),
      },
    });
  };

  const saveLocation = async () => {
    if (
      !locationName.trim() ||
      !locationAddress.trim() ||
      !locationCity.trim()
    ) {
      Alert.alert("Липсват данни", "Попълни име, адрес и град за локацията.");
      return;
    }

    const created = await apiRequest<NewLocation>(`/api/locations`, {
      token,
      method: "POST",
      body: {
        name: locationName.trim(),
        address: locationAddress.trim(),
        city: locationCity.trim(),
        country: "България",
      },
    });

    setLocation(created);
  };

  const saveSchedule = async () => {
    if (!location?._id) {
      Alert.alert("Липсва локация", "Създай локация преди графика.");
      return;
    }

    const today = new Date();
    const future = new Date();
    future.setFullYear(today.getFullYear() + 1);

    await apiRequest(`/api/staff-schedules`, {
      token,
      method: "POST",
      body: {
        locationId: location._id,
        startDate: today.toISOString().split("T")[0],
        endDate: future.toISOString().split("T")[0],
        workTime: { start: workStart, end: workEnd },
        isDayOff: {
          saturday: false,
          sunday: false,
        },
      },
    });
  };

  const saveService = async () => {
    if (!serviceName.trim() || !serviceCategory.trim()) {
      Alert.alert("Липсват данни", "Добави име и категория на услуга.");
      return;
    }

    await apiRequest(`/api/service`, {
      token,
      method: "POST",
      body: {
        name: serviceName.trim(),
        description: "",
        duration: Number(serviceDuration) || 60,
        price: Number(servicePrice) || 0,
        category: serviceCategory.trim(),
        paymentOption: "cash",
        ...(location?._id ? { locationId: location._id } : {}),
      },
    });
  };

  const saveStaff = async () => {
    if (!staffEmail.trim()) {
      return;
    }

    await apiRequest(`/api/staff/invite`, {
      token,
      method: "POST",
      body: {
        email: staffEmail.trim().toLowerCase(),
        firstName: staffFirstName.trim() || "Staff",
        lastName: staffLastName.trim() || "Member",
        ...(location?._id ? { locationId: location._id } : {}),
      },
    });
  };

  const handleContinue = async () => {
    try {
      setSaving(true);

      if (currentStep === 1) await saveBusiness();
      if (currentStep === 2) await saveLocation();
      if (currentStep === 3) await saveSchedule();
      if (currentStep === 4) await saveService();
      if (currentStep === 5) await saveStaff();

      if (currentStep < STEPS.length) {
        setCurrentStep((prev) => prev + 1);
        return;
      }

      await refreshSessionData();
      const refreshedLocations = await apiRequest<NewLocation[]>(
        `/api/locations?businessId=${businessId}`,
        {
          token,
        },
      ).catch(() => []);

      if ((refreshedLocations?.length ?? 0) > 1) {
        router.replace("/(dashboar)/locations");
      } else {
        router.replace("/(dashboar)/dashboard");
      }
    } catch (error) {
      Alert.alert(
        "Грешка",
        error instanceof Error
          ? error.message
          : "Възникна грешка при записване на стъпката.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.label}>Business name</ThemedText>
          <ThemedTextInput
            value={businessName}
            onChangeText={setBusinessName}
          />
          <ThemedText style={styles.label}>Category</ThemedText>
          <ThemedTextInput
            value={businessCategory}
            onChangeText={setBusinessCategory}
            placeholder="Beauty, Barber, Dental..."
          />
          <ThemedText style={styles.label}>About</ThemedText>
          <ThemedTextInput
            value={businessAbout}
            onChangeText={setBusinessAbout}
          />
          <ThemedText style={styles.label}>Phone</ThemedText>
          <ThemedTextInput
            value={businessPhone}
            onChangeText={setBusinessPhone}
          />
        </View>
      );
    }

    if (currentStep === 2) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.label}>Location name</ThemedText>
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
        </View>
      );
    }

    if (currentStep === 3) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.label}>Work starts (HH:mm)</ThemedText>
          <ThemedTextInput value={workStart} onChangeText={setWorkStart} />
          <ThemedText style={styles.label}>Work ends (HH:mm)</ThemedText>
          <ThemedTextInput value={workEnd} onChangeText={setWorkEnd} />
        </View>
      );
    }

    if (currentStep === 4) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.label}>Service name</ThemedText>
          <ThemedTextInput value={serviceName} onChangeText={setServiceName} />
          <ThemedText style={styles.label}>Category</ThemedText>
          <ThemedTextInput
            value={serviceCategory}
            onChangeText={setServiceCategory}
          />
          <ThemedText style={styles.label}>Duration (minutes)</ThemedText>
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
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <ThemedText style={styles.helperText}>
          Тази стъпка е по избор. Ако искаш, покани първия служител.
        </ThemedText>
        <ThemedText style={styles.label}>Staff email</ThemedText>
        <ThemedTextInput
          value={staffEmail}
          onChangeText={setStaffEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ThemedText style={styles.label}>First name</ThemedText>
        <ThemedTextInput
          value={staffFirstName}
          onChangeText={setStaffFirstName}
        />
        <ThemedText style={styles.label}>Last name</ThemedText>
        <ThemedTextInput
          value={staffLastName}
          onChangeText={setStaffLastName}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container} safe={true}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText title={true} style={styles.title}>
          Onboarding
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Стъпка {currentStep} от {STEPS.length}: {STEPS[currentStep - 1]}
        </ThemedText>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {renderStep()}

        <View style={styles.actionsRow}>
          <Pressable
            disabled={!canGoBack || saving}
            onPress={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            <ThemedText
              style={[
                styles.backAction,
                (!canGoBack || saving) && styles.disabledAction,
              ]}
            >
              Back
            </ThemedText>
          </Pressable>

          <ThemedButton onPress={handleContinue} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {currentStep === STEPS.length ? "Finish" : "Continue"}
              </ThemedText>
            )}
          </ThemedButton>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 12,
    opacity: 0.8,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#ddd",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: 8,
    backgroundColor: Colors.primary,
  },
  section: {
    gap: 8,
  },
  label: {
    marginTop: 8,
    fontWeight: "600",
  },
  helperText: {
    opacity: 0.8,
    marginBottom: 6,
  },
  actionsRow: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backAction: {
    color: Colors.primary,
    fontWeight: "700",
  },
  disabledAction: {
    opacity: 0.4,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});
