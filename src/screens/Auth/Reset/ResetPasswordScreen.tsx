// @ts-nocheck
import React, { useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../../navigation/AuthNavigator';
import {
  View,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';
import colors from '../../../theme/color';
import Loader from '../../../components/Loader';
import CustomInput from '../../../components/Input';
import CustomButton from '../../../components/Button';
import { Typography } from '../../../components/Typography';
import styles from './ResetPasswordStyle';
import { extractErrorMessage } from '../../../utils/errorMessageExtractor';
import { showAlert } from '../../../utils/showAlert';
import authApi from '../../../api/authApi';
import storage from '../../../utils/Storage';
import { useAppDispatch } from '../../../hooks/useRedux';
import { setCredentials } from '../../../store/slices/authSlice';

type ResetPasswordProps = StackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<ResetPasswordProps> = ({ navigation, route }) => {
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const token: string | undefined = route?.params?.token;

  // input refs removed — CustomInput doesn't expose a forwarded ref
  const dispatch = useAppDispatch();

  const validateAll = () => {
    const e: Record<string, string> = {};
    if (!oldPassword) e.oldPassword = 'Old password is required';
    if (!newPassword) e.newPassword = 'New password is required';
    if (!confirmPassword) e.confirmPassword = 'Confirm password is required';
    if (newPassword && newPassword.length < 6)
      e.newPassword = 'Password must be at least 6 characters';
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    setSubmitted(true);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    // Guard against missing token
    if (!token) {
      setErrors({ general: 'Missing or expired token. Please request a new password reset link.' });
      // Send user back to forgot password where they can request a new link
      navigation.navigate('ForgotPassword');
      return;
    }

    if (!validateAll()) return;
    setIsLoading(true);
    try {
      const payload = {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };

      const response = (await authApi.changePassword(payload, token)) as {
        status: boolean;
        error?: number;
        data?: { access_token?: string; refresh_token?: string };
        message?: string;
      };

      if (!response || !response.status) {
        throw new Error(response?.message || 'Password change failed');
      }

      // If backend returned tokens, persist them and navigate to Home
      const access = response.data?.access_token;
      const refresh = response.data?.refresh_token;
      if (access && refresh) {
        try {
          storage.setTokens({ access, refresh });
          // update redux auth state so RootNavigator will switch to App stack
          // setCredentials expects user, accessToken, refreshToken, permissions
          dispatch(
            setCredentials({
              user: { id: '', email: '', first_name: '', last_name: '' },
              access: access,
              refresh: refresh,
            }),
          );
        } catch (storageErr) {
          // continue even if storage fails; show success message
          // but log in console for debugging

          console.warn('Failed to persist tokens after password reset', storageErr);
        }
      }

      // Success: show alert; RootNavigator will switch to App (Home tab) after credentials are set
      showAlert('Success', response.message || 'Password changed successfully');
    } catch (err: unknown) {
      const message = extractErrorMessage(err);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string) => {
    return submitted ? errors[field] : undefined;
  };

  const content = (
    <>
      <Loader visible={isLoading} text="Updating password..." />

      <LinearGradient
        colors={colors.appBackgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              <View style={styles.logoCircle}>
                <Typography variant="h1" size={32} weight="700" style={styles.logoText}>
                  T
                </Typography>
              </View>

              <View style={styles.card}>
                <View style={styles.cardIconWrapper}>
                  <View style={styles.cardIconCircle}>
                    <Lock size={24} color={colors.primary} />
                  </View>
                </View>

                <Typography
                  variant="h5"
                  size={18}
                  weight="700"
                  align="center"
                  style={styles.cardTitle}
                >
                  Reset Password
                </Typography>
                <Typography variant="caption" size={13} align="center" style={styles.cardSubtitle}>
                  Enter your old password and choose a new password
                </Typography>

                <CustomInput
                  label="Old Password"
                  value={oldPassword}
                  onChangeText={(t: string) => setOldPassword(t)}
                  secureTextEntry
                  placeholder="Enter old password"
                  leftIcon={<Lock size={18} color={colors.primary} />}
                  required
                  error={getFieldError('oldPassword')}
                  returnKeyType="next"
                  onSubmitEditing={() => {}}
                />

                <CustomInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={(t: string) => setNewPassword(t)}
                  secureTextEntry
                  placeholder="Enter new password"
                  leftIcon={<Lock size={18} color={colors.primary} />}
                  required
                  error={getFieldError('newPassword')}
                  returnKeyType="next"
                  onSubmitEditing={() => {}}
                />

                <CustomInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(t: string) => setConfirmPassword(t)}
                  secureTextEntry
                  placeholder="Confirm new password"
                  leftIcon={<Lock size={18} color={colors.primary} />}
                  required
                  error={getFieldError('confirmPassword')}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />

                {errors.general ? (
                  <Typography
                    variant="caption"
                    size={13}
                    color={colors.error}
                    style={styles.errorText}
                  >
                    {errors.general}
                  </Typography>
                ) : null}

                <CustomButton
                  title="Update Password"
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isLoading}
                />
              </View>

              <Typography variant="overline" size={11} style={styles.footerText}>
                Toagosei India Private Limited © {new Date().getFullYear()}
              </Typography>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </>
  );

  return Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={0}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    <View style={styles.container}>{content}</View>
  );
};

export default ResetPasswordScreen;
