import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  type UpdateProfilePayload,
} from "@src/api/auth";
import ScrollScreen from "@src/components/layout/scroll-screen";
import ApiFeedback from "@src/components/ui/api-feedback";
import FormField from "@src/components/ui/form-field";
import SubmitButton from "@src/components/ui/submit-button";
import { getApiErrorMessage } from "@src/utils/api-error";

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setProfileError(null);
        const profile = await getMyProfile();
        setProfileForm({
          firstName: profile.firstName ?? "",
          lastName: profile.lastName ?? "",
          email: profile.email ?? "",
          phone: profile.phone ?? "",
        });
      } catch (err) {
        setProfileError(getApiErrorMessage(err, "Failed to load profile"));
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, []);

  const profileValidationError = useMemo(() => {
    if (!profileForm.firstName.trim()) return "First name is required";
    if (!profileForm.lastName.trim()) return "Last name is required";
    if (!profileForm.email.trim()) return "Email is required";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(profileForm.email.trim())) return "Email format is invalid";
    return null;
  }, [profileForm]);

  const passwordValidationError = useMemo(() => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const anyFilled = currentPassword || newPassword || confirmPassword;
    if (!anyFilled) return "Enter password fields to update password";
    if (!currentPassword) return "Current password is required";
    if (!newPassword) return "New password is required";
    if (newPassword.length < 8) return "New password must be at least 8 characters";
    if (!confirmPassword) return "Confirm password is required";
    if (newPassword !== confirmPassword) return "Password confirmation does not match";
    return null;
  }, [passwordForm]);

  const onSaveProfile = async () => {
    if (profileValidationError) {
      setProfileError(profileValidationError);
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);

      const payload: UpdateProfilePayload = {
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
      };

      const updated = await updateMyProfile(payload);
      setProfileForm({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        email: updated.email ?? "",
        phone: updated.phone ?? "",
      });
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(getApiErrorMessage(err, "Failed to update profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async () => {
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      await changeMyPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess("Password updated successfully.");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Failed to update password"));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <ScrollScreen title="Profile">
        <View style={styles.loadingWrap}>
          <ActivityIndicator />
        </View>
      </ScrollScreen>
    );
  }

  return (
    <ScrollScreen title="Profile" keyboardAvoiding>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal info</Text>
        <ApiFeedback message={profileError || profileSuccess} tone={profileError ? "error" : "success"} />
        <FormField
          label="First name"
          value={profileForm.firstName}
          onChange={(value) => setProfileForm((prev) => ({ ...prev, firstName: value }))}
          placeholder="First name"
          iconName="account"
        />
        <FormField
          label="Last name"
          value={profileForm.lastName}
          onChange={(value) => setProfileForm((prev) => ({ ...prev, lastName: value }))}
          placeholder="Last name"
          iconName="account"
        />
        <FormField
          label="Email"
          value={profileForm.email}
          onChange={(value) => setProfileForm((prev) => ({ ...prev, email: value }))}
          placeholder="Email"
          keyboardType="email-address"
          iconName="email"
        />
        <FormField
          label="Phone"
          value={profileForm.phone}
          onChange={(value) => setProfileForm((prev) => ({ ...prev, phone: value }))}
          placeholder="Phone"
          keyboardType="phone-pad"
          iconName="phone"
        />
        <SubmitButton
          label="Save profile"
          loadingLabel="Saving profile..."
          loading={savingProfile}
          onPress={onSaveProfile}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <ApiFeedback message={passwordError || passwordSuccess} tone={passwordError ? "error" : "success"} />
        <FormField
          label="Current password"
          value={passwordForm.currentPassword}
          onChange={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
          placeholder="Current password"
          secureTextEntry
          iconName="lock"
        />
        <FormField
          label="New password"
          value={passwordForm.newPassword}
          onChange={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
          placeholder="New password"
          secureTextEntry
          iconName="lock"
        />
        <FormField
          label="Confirm password"
          value={passwordForm.confirmPassword}
          onChange={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
          placeholder="Confirm password"
          secureTextEntry
          iconName="lock-check"
        />
        <SubmitButton
          label="Change password"
          loadingLabel="Updating password..."
          loading={savingPassword}
          onPress={onChangePassword}
        />
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e1e6f3",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2a44",
    marginBottom: 6,
  },
});
