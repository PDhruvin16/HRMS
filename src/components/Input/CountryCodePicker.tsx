// @ts-nocheck
// @ts-nocheck
import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet, Pressable } from 'react-native';
import { Typography } from '../Typography';
import { COUNTRIES, Country } from '../../constants/countries';
import colors from '../../theme/color';
import { moderateScale } from '../../utils/responsive';
import { ChevronDown } from 'lucide-react-native';

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  disabled?: boolean;
  hideDialCode?: boolean;
}

const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  selectedCountry,
  onSelect,
  disabled,
  hideDialCode = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const themeColors = colors;

  const handleSelect = (country: Country) => {
    onSelect(country);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Typography variant="body2" style={styles.flag}>
          {selectedCountry.flag}
        </Typography>
        {!hideDialCode && (
          <Typography variant="body2" style={[styles.code, { color: themeColors.dark }]}>
            {selectedCountry.dialCode}
          </Typography>
        )}
        <ChevronDown
          size={moderateScale(14)}
          color={themeColors.gray}
          style={
            hideDialCode
              ? { marginLeft: moderateScale(4), marginRight: moderateScale(8) }
              : undefined
          }
        />
        {!hideDialCode && (
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
        )}
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.white }]}>
            <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
              <Typography variant="h5" weight="700">
                Select Country
              </Typography>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    item.code === selectedCountry.code && {
                      backgroundColor: themeColors.primary + '15',
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Typography variant="body1" style={styles.itemFlag}>
                    {item.flag}
                  </Typography>
                  <Typography
                    variant="body1"
                    style={[styles.itemName, { color: themeColors.dark }]}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    style={[styles.itemCode, { color: themeColors.gray }]}
                  >
                    {item.dialCode}
                  </Typography>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: moderateScale(2),
      // height: '100%',
    },
    flag: {
      fontSize: moderateScale(18),
      marginRight: moderateScale(6),
    },
    code: {
      fontSize: moderateScale(15),
      fontFamily: 'DMSans-Medium',
      marginRight: moderateScale(4),
    },
    divider: {
      width: 1,
      height: moderateScale(22),
      marginLeft: moderateScale(10),
      marginRight: moderateScale(4),
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: themeColors.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: moderateScale(24),
      borderTopRightRadius: moderateScale(24),
      maxHeight: '70%',
      paddingBottom: moderateScale(30),
    },
    modalHeader: {
      padding: moderateScale(20),
      alignItems: 'center',
      borderBottomWidth: 1,
    },
    listContent: {
      paddingVertical: moderateScale(10),
    },
    countryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: moderateScale(14),
      paddingHorizontal: moderateScale(20),
    },
    itemFlag: {
      fontSize: moderateScale(24),
      marginRight: moderateScale(16),
    },
    itemName: {
      flex: 1,
      fontSize: moderateScale(16),
    },
    itemCode: {
      fontSize: moderateScale(14),
    },
  });
})();

export default CountryCodePicker;
