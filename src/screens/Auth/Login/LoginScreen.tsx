// @ts-nocheck
import { StackScreenProps } from '@react-navigation/stack';
import { Mail, Eye, EyeOff } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  ImageBackground,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CREDLoader } from '../../../components/Loader/CREDLoader';
import { Typography } from '../../../components/Typography';
import colors from '../../../theme/color';
import styles from './LoginScreenStyle';
import { useAuth } from '../../../hooks/useAuth';
import {
  PATTERNS,
  validateForm,
  ValidationErrors,
  ValidationRules,
} from '../../../utils/Validator';
import { extractErrorMessage } from '../../../utils/errorMessageExtractor';
import { normalize } from '../../../utils/responsive';
import { useToast } from '../../../context/ToastContext';
import { triggerHaptic } from '../../../utils/haptic';

type AuthStackParamList = {
  Login: { message?: string } | undefined;
  ResetPassword: { token?: string; email?: string } | undefined;
  ForgotPassword: undefined;
};

type LoginScreenProps = StackScreenProps<AuthStackParamList, 'Login'>;

const splashImg = require('../../../../assets/images/Splash1.png');

let isFirstMount = true;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);
  const isMountedRef = useRef(true);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { login, isLoading } = useAuth();

  // Mathematically calculate the exact vertical dead center of the screen relative to ScrollView flow
  const startTranslateY = React.useMemo(() => {
    const screenHeight = Dimensions.get('window').height;
    // ScrollView top padding is insets.top + normalize(40). Logo row height is 80, so its center is 40.
    return screenHeight / 2 - (insets.top + normalize(40) + 40);
  }, [insets.top]);

  const [isImageLoaded, setIsImageLoaded] = useState(true);
  const bgFadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(isFirstMount ? 0 : 1)).current;
  const logoScaleAnim = useRef(new Animated.Value(isFirstMount ? 4 : 1)).current;
  const logoTranslateY = useRef(new Animated.Value(isFirstMount ? startTranslateY : 0)).current;
  const contentOpacity = useRef(new Animated.Value(isFirstMount ? 0 : 1)).current;
  const contentTranslateY = useRef(new Animated.Value(isFirstMount ? normalize(60) : 0)).current;

  useEffect(() => {
    if (isFirstMount) {
      if (isImageLoaded) {
        Animated.sequence([
          // 1. Play Splash Animation (Logo fade-in and scale-down)
          Animated.parallel([
            Animated.timing(bgFadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(logoFadeAnim, {
              toValue: 1,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(logoScaleAnim, {
              toValue: 1,
              duration: 1800,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),

          // Tiny pause at the center
          Animated.delay(200),

          // 2. Animate logo up from center to top
          Animated.timing(logoTranslateY, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.ease), // Smooth deceleration
            useNativeDriver: true,
          }),

          // 3. Animate form content fade & slide up
          Animated.parallel([
            Animated.timing(contentOpacity, {
              toValue: 1,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(contentTranslateY, {
              toValue: 0,
              duration: 700,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          isFirstMount = false;
        });
      }
    } else {
      bgFadeAnim.setValue(1);
    }
  }, [
    isImageLoaded,
    bgFadeAnim,
    contentOpacity,
    contentTranslateY,
    logoFadeAnim,
    logoScaleAnim,
    logoTranslateY,
  ]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const msg = route?.params?.message;
    if (msg) {
      showToast({
        message: msg,
        type: 'success',
      });
      navigation.setParams?.({ message: undefined });
    }
  }, [route?.params?.message, navigation, showToast]);

  const validationRules: ValidationRules = {
    email: {
      required: true,
      pattern: PATTERNS.email,
      message: 'Please enter a valid email address',
    },
    password: { required: true, minLength: 6, message: 'Password must be at least 6 characters' },
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateSingleField(fieldName);
  };

  const validateSingleField = (fieldName: string) => {
    const formData = { email, password };
    const fieldValue = formData[fieldName as keyof typeof formData];
    const fieldRules = validationRules[fieldName];
    if (fieldRules) {
      const fieldErrors = validateForm({ [fieldName]: fieldValue }, { [fieldName]: fieldRules });
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldErrors[fieldName]) next[fieldName] = fieldErrors[fieldName];
        else delete next[fieldName];
        return next;
      });
    }
  };

  const validateAllFields = (): boolean => {
    const formData = { email, password };
    const validationErrors = validateForm(formData, validationRules);
    setErrors(validationErrors);
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    setSubmitted(true);
    return Object.keys(validationErrors).length === 0;
  };

  const handleLogin = async () => {
    triggerHaptic();
    if (!validateAllFields()) return;
    try {
      await login({ email, password });
    } catch (error: unknown) {
      if (isMountedRef.current) {
        const errorMessage = extractErrorMessage(error);
        setErrors((prev) => ({ ...prev, general: errorMessage }));
        showToast({
          message: errorMessage,
          type: 'error',
        });
      }
    }
  };

  const getFieldError = (fieldName: string): string | undefined =>
    touched[fieldName] || submitted ? errors[fieldName] : undefined;

  const content = (
    <View style={styles.container}>
      <Animated.View style={[styles.flex1, { opacity: bgFadeAnim }]}>
        <Modal visible={isLoading} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <CREDLoader
              text="AUTHENTICATING..."
              transparentCard={true}
              textColor={colors.black}
              barColors={['#35A1DA', '#867ADD', '#D4549F', '#E25760', '#F15A22']}
            />
          </View>
        </Modal>
        <StatusBar translucent barStyle="dark-content" backgroundColor="transparent" />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={{ marginTop: insets.top }}
            contentContainerStyle={[styles.scrollContent, { paddingTop: normalize(40) }]}
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentWrapper}>
              {/* SalesBot Logo with Masked Linear Gradient */}
              <Animated.View
                style={[
                  styles.logoRow,
                  {
                    opacity: logoFadeAnim,
                    transform: [{ translateY: logoTranslateY }, { scale: logoScaleAnim }],
                  },
                ]}
              >
                <MaskedView
                  style={styles.maskedView}
                  maskElement={
                    <View style={styles.maskContent}>
                      <Text style={styles.brandText}>HRMS App</Text>
                    </View>
                  }
                >
                  <LinearGradient
                    colors={colors.splashGradient}
                    locations={[0.0781, 0.5065, 0.9604]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                </MaskedView>
              </Animated.View>

              <Animated.View
                style={[
                  styles.width100,
                  { opacity: contentOpacity, transform: [{ translateY: contentTranslateY }] },
                ]}
              >
                {/* Header Titles */}
                <Typography variant="h2" weight="800" style={styles.titleText}>
                  Get Started Now
                </Typography>
                <Typography variant="body1" style={styles.subtitleText}>
                  Sign in to manage leaves, attendance & team details
                </Typography>

                {/* Email Field */}
                <View style={[styles.inputBox, getFieldError('email') && styles.inputErrorBorder]}>
                  <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>
                      Email<Text style={styles.redStar}>*</Text>
                    </Text>
                    <View style={styles.fieldRow}>
                      <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={(text: string) => {
                          setEmail(text.trim());
                          if (errors.general) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.general;
                              return n;
                            });
                          }
                          if (touched.email || submitted) validateSingleField('email');
                        }}
                        onBlur={() => handleBlur('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter Email"
                        placeholderTextColor={colors.text.placeholder}
                      />
                      <Mail size={normalize(20)} color={colors.muted} style={styles.rightIcon} />
                    </View>
                  </View>
                </View>
                {getFieldError('email') ? (
                  <Text style={styles.fieldErrorText}>{getFieldError('email')}</Text>
                ) : null}

                {/* Password Field */}
                <View
                  style={[styles.inputBox, getFieldError('password') && styles.inputErrorBorder]}
                >
                  <View style={styles.inputInner}>
                    <Text style={styles.inputLabel}>
                      Password<Text style={styles.redStar}>*</Text>
                    </Text>
                    <View style={styles.fieldRow}>
                      <TextInput
                        style={styles.textInput}
                        value={password}
                        onChangeText={(text: string) => {
                          setPassword(text);
                          if (errors.general) {
                            setErrors((prev) => {
                              const n = { ...prev };
                              delete n.general;
                              return n;
                            });
                          }
                          if (touched.password || submitted) validateSingleField('password');
                        }}
                        onBlur={() => handleBlur('password')}
                        secureTextEntry={secureText}
                        placeholder="Enter Password"
                        placeholderTextColor={colors.text.placeholder}
                      />
                      <TouchableOpacity
                        onPress={() => setSecureText(!secureText)}
                        activeOpacity={0.7}
                      >
                        {secureText ? (
                          <Eye size={normalize(20)} color={colors.muted} style={styles.rightIcon} />
                        ) : (
                          <EyeOff
                            size={normalize(20)}
                            color={colors.muted}
                            style={styles.rightIcon}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                {getFieldError('password') ? (
                  <Text style={styles.fieldErrorText}>{getFieldError('password')}</Text>
                ) : null}

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  activeOpacity={0.7}
                  style={styles.forgotPassContainer}
                >
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* General Error */}
                {errors.general ? (
                  <Text style={styles.generalErrorText}>{errors.general}</Text>
                ) : null}

                {/* Premium Login Button with Dual Linear Gradient (Border & Background) */}
                <TouchableOpacity
                  onPress={handleLogin}
                  activeOpacity={0.8}
                  style={styles.btnWrapper}
                >
                  <View style={styles.gradientBorderContainer}>
                    {/* Border Gradient */}
                    <LinearGradient
                      colors={colors.loginButtonBorderGradient}
                      locations={[0, 0.5048, 1]}
                      start={{ x: 0, y: 0.5 }}
                      end={{ x: 1, y: 0.5 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.btnInner}>
                      {/* Background Gradient */}
                      <LinearGradient
                        colors={colors.loginButtonBgGradient}
                        locations={[0, 0.5192, 0.9952]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFill}
                      />
                      <View style={styles.btnContent}>
                        <Text style={styles.btnText}>Login</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    To create an account, please visit{' '}
                    <Text style={styles.footerLink}>our website.</Text>
                  </Text>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );

  return Platform.OS === 'ios' ? (
    <KeyboardAvoidingView style={styles.flex1} behavior="padding" keyboardVerticalOffset={0}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    <View style={styles.flex1}>{content}</View>
  );
};

export default LoginScreen;
