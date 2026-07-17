// @ts-nocheck
import React, {
  useCallback,
  useMemo,
  useRef,
  ReactNode,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import colors from '../../theme/color';
import { Typography } from '../Typography';
import { normalize } from '../../utils/responsive';
import spacing from '../../theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomTabBarHeight } from '../../utils/layout';

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
  destructive?: boolean;
}

export interface AppBottomSheetProps {
  bottomSheetRef?: React.RefObject<BottomSheet | null>;
  snapPoints?: (string | number)[];
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  onClose?: () => void;
  index?: number;
  visible?: boolean;
  options?: ActionSheetOption[];
  cancelLabel?: string;
  footer?: ReactNode;
  footerComponent?: React.FC<BottomSheetFooterProps>;
  useTabBarPadding?: boolean;
  scrollable?: boolean;
}

const AppBottomSheet = forwardRef<BottomSheet, AppBottomSheetProps>((props, ref) => {
  const {
    bottomSheetRef: externalRef,
    snapPoints = ['90%'],
    children,
    title,
    subtitle,
    onClose,
    index = -1,
    visible,
    options,
    cancelLabel = 'Cancel',
    footer,
    footerComponent,
    useTabBarPadding = true,
    scrollable = false,
  } = props;

  const themeColors = colors;
  const insets = useSafeAreaInsets();

  const internalRef = useRef<BottomSheet>(null);
  const bottomSheetRef = externalRef || internalRef;

  // Sync ref with forwardRef
  useImperativeHandle(ref, () => bottomSheetRef.current as BottomSheet);

  const bottomPadding = useMemo(() => {
    if (!useTabBarPadding) return normalize(spacing.xl);
    const totalBarHeight = getBottomTabBarHeight(insets.bottom);
    return totalBarHeight + normalize(spacing.xl);
  }, [useTabBarPadding, insets.bottom]);

  React.useEffect(() => {
    if (visible !== undefined) {
      if (visible) {
        bottomSheetRef.current?.snapToIndex(0);
      } else {
        bottomSheetRef.current?.close();
      }
    }
  }, [visible, bottomSheetRef]);

  const sheetIndex = useMemo(() => {
    if (visible !== undefined) return visible ? 0 : -1;
    return index;
  }, [visible, index]);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderFooter = useCallback(
    (footerProps: BottomSheetFooterProps) => {
      if (footerComponent) {
        const FooterComp = footerComponent;
        return <FooterComp {...footerProps} />;
      }
      if (!footer) return null;
      return (
        <BottomSheetFooter {...footerProps} bottomInset={0}>
          <View style={[styles.footerContainer, { paddingBottom: bottomPadding }]}>{footer}</View>
        </BottomSheetFooter>
      );
    },
    [footer, footerComponent, bottomPadding],
  );

  const handleOptionPress = (option: ActionSheetOption) => {
    option.onPress();
    onClose?.();
  };

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: themeColors.white,
      borderTopLeftRadius: normalize(32),
      borderTopRightRadius: normalize(32),
      borderWidth: 1,
      borderColor: themeColors.border,
    }),
    [themeColors],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={sheetIndex}
      snapPoints={snapPoints}
      enableDynamicSizing={!props.snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onClose={onClose}
      handleComponent={null}
      backgroundStyle={backgroundStyle}
      footerComponent={renderFooter}
    >
      <View style={[styles.contentContainer, { backgroundColor: themeColors.white }]}>
        <View style={styles.handleContainer}>
          <View style={[styles.handle, { backgroundColor: themeColors.lightGray }]} />
        </View>

        {title && (
          <View style={styles.headerContainer}>
            <Typography
              variant="h5"
              weight="900"
              style={[styles.headerTitle, { color: themeColors.dark }]}
            >
              {title}
            </Typography>
          </View>
        )}

        <View style={styles.body}>
          {children ? (
            scrollable ? (
              <BottomSheetScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.scrollContentContainer,
                  { paddingBottom: normalize(spacing.xl) * 2 },
                ]}
                focusHook={() => {}}
              >
                {subtitle && (
                  <Typography variant="body2" style={styles.subtitle}>
                    {subtitle}
                  </Typography>
                )}
                {children}
              </BottomSheetScrollView>
            ) : (
              <View style={[styles.scrollContentContainer, styles.flex1]}>
                {subtitle && (
                  <Typography variant="body2" style={styles.subtitle}>
                    {subtitle}
                  </Typography>
                )}
                {children}
              </View>
            )
          ) : (
            options && (
              <View style={styles.modalInner}>
                <View style={[styles.content, { paddingBottom: bottomPadding }]}>
                  <View style={styles.optionsContainer}>
                    {options.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.optionButton,
                          idx === options.length - 1 && styles.optionButtonLast,
                        ]}
                        onPress={() => handleOptionPress(option)}
                      >
                        <Typography
                          variant="body1"
                          style={[
                            styles.optionText,
                            option.variant === 'destructive' && styles.optionTextDestructive,
                          ]}
                        >
                          {option.label}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Typography variant="body1" style={styles.cancelText}>
                      {cancelLabel}
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            )
          )}
        </View>
      </View>
    </BottomSheet>
  );
});

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      borderTopLeftRadius: normalize(32),
      borderTopRightRadius: normalize(32),
      overflow: 'hidden',
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: normalize(12),
    },
    handle: {
      width: normalize(42),
      height: normalize(5),
      borderRadius: normalize(3),
    },
    headerContainer: {
      paddingHorizontal: normalize(24),
      paddingBottom: normalize(12),
      alignItems: 'center',
    },
    headerTitle: {
      letterSpacing: -0.8,
      textAlign: 'center',
    },
    body: {
      flex: 1,
    },
    modalInner: {
      flex: 1,
      paddingHorizontal: normalize(spacing.md),
    },
    content: {},
    subtitle: {
      textAlign: 'center',
      marginBottom: normalize(spacing.lg),
      color: themeColors.text.secondary,
    },
    optionsContainer: {
      marginBottom: normalize(spacing.md),
    },
    optionButton: {
      paddingVertical: normalize(spacing.md),
      paddingHorizontal: normalize(spacing.md),
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    optionButtonLast: {
      borderBottomWidth: 0,
    },
    optionText: {
      color: themeColors.primary,
      textAlign: 'center',
    },
    optionTextDestructive: {
      color: themeColors.error,
    },
    cancelButton: {
      marginTop: normalize(spacing.md),
      paddingVertical: normalize(spacing.md),
      paddingHorizontal: normalize(spacing.md),
      borderRadius: normalize(12),
      backgroundColor: themeColors.lightBackground,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
    },
    cancelText: {
      color: themeColors.error,
      textAlign: 'center',
      fontWeight: '600',
    },
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: normalize(spacing.md),
    },
    flex1: {
      flex: 1,
    },
    footerContainer: {
      paddingTop: normalize(spacing.sm),
      backgroundColor: themeColors.white,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      paddingHorizontal: normalize(spacing.md),
      width: '100%',
    },
  });
})();

export default AppBottomSheet;
