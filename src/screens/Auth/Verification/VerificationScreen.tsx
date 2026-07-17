// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useAuth } from '../../../hooks/useAuth';
import Loader from '../../../components/Loader';
import colors from '../../../theme/color';
import CustomButton from '../../../components/Button';
import { Typography } from '../../../components/Typography';
import styles from './VerificationStyle';

interface OTPVerificationScreenProps {
  route: {
    params: {
      mobile: string;
    };
  };
  navigation: Record<string, unknown>;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({ route, navigation }) => {
  const themeColors = colors;
  const { login, isLoading } = useAuth();
  const { mobile } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mobileError, setMobileError] = useState('');

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Allow only numeric input and single character
    value = value.replace(/\D/g, '');
    if (value.length > 1) {
      value = value.charAt(0);
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    setMobileError('');

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    // Validate OTP length and numeric
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      setError('Please enter a complete 6-digit numeric OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await (login as any)({ otp: otpString });
      // Navigation will be handled by RootNavigator after auth state updates
    } catch (err: unknown) {
      const errorObj = err as unknown as Record<string, unknown>;
      setError(
        (typeof errorObj?.message === 'string'
          ? errorObj.message
          : 'Invalid OTP. Please try again.') || 'Invalid OTP. Please try again.',
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    // You can add resend OTP logic here
  };

  const MOBILE_LENGTH = 10; // assumption: 10 digit mobile number - adjust as needed
  const OTP_LENGTH = 6;

  // Validate mobile number on mount
  useEffect(() => {
    const sanitized = (mobile || '').replace(/\D/g, '');
    if (!sanitized) {
      setMobileError('Invalid mobile number');
    } else if (sanitized.length !== MOBILE_LENGTH) {
      setMobileError(`Mobile number must be ${MOBILE_LENGTH} digits`);
    } else {
      setMobileError('');
    }
  }, [mobile]);

  const isValid =
    mobileError === '' &&
    otp.every((digit) => digit !== '' && /^\d$/.test(digit)) &&
    otp.join('').length === OTP_LENGTH;

  return (
    <View style={styles.container}>
      <Loader visible={isLoading || isSubmitting} text="Verifying OTP..." />

      <LinearGradient
        colors={themeColors.appBackgroundGradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradientBackground}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as unknown as { goBack: () => void }).goBack()}
        >
          <ArrowLeft size={24} color={colors.white} />
        </TouchableOpacity>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              <View style={styles.logoCircle}>
                <Lock size={32} color={colors.white} />
              </View>

              <Typography
                variant="h2"
                size={24}
                weight="700"
                color={colors.white}
                style={styles.title}
              >
                Verify OTP
              </Typography>
              <View style={styles.subtitleContainer}>
                <Typography
                  variant="body2"
                  size={14}
                  color={colors.authWhiteDarkText}
                  align="center"
                  style={styles.subtitle}
                >
                  Enter the 6-digit code sent to
                </Typography>
                <Typography
                  variant="body2"
                  size={14}
                  weight="700"
                  color={colors.white}
                  align="center"
                  style={styles.mobileNumber}
                >
                  {mobile}
                </Typography>
              </View>

              <View style={styles.card}>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                        error && styles.otpInputError,
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {error ? (
                  <Typography
                    variant="caption"
                    size={13}
                    weight="500"
                    color={colors.error}
                    align="center"
                    style={styles.errorText}
                  >
                    {error}
                  </Typography>
                ) : null}

                <Typography
                  variant="caption"
                  size={13}
                  color={colors.gray}
                  align="center"
                  style={styles.hintText}
                >
                  Use OTP:{' '}
                  <Typography weight="700" color={colors.headerOrange} style={styles.hintOtp}>
                    123456
                  </Typography>
                </Typography>

                <CustomButton
                  title="Verify & Continue"
                  onPress={handleVerifyOtp}
                  loading={isSubmitting}
                  disabled={!isValid || isSubmitting}
                  variant="custom"
                  customColors={[colors.headerGradientStart, colors.headerGradientEnd]}
                />

                <View style={styles.resendContainer}>
                  <Typography
                    variant="caption"
                    size={13}
                    color={colors.gray}
                    style={styles.resendText}
                  >
                    Didn't receive the code?{' '}
                  </Typography>
                  <TouchableOpacity onPress={handleResendOtp}>
                    <Typography
                      variant="caption"
                      size={13}
                      weight="700"
                      color={colors.headerGradientStart}
                      style={styles.resendLink}
                    >
                      Resend OTP
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>

              <Typography
                variant="overline"
                size={11}
                color={colors.authWhiteDarkText}
                style={styles.footerText}
              >
                Toagosei India Private Limited © 2024
              </Typography>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </LinearGradient>
    </View>
  );
};

export default OTPVerificationScreen;
