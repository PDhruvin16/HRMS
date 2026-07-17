// @ts-nocheck
// @ts-nocheck
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Search, X, Check } from 'lucide-react-native';
import { Typography } from '../Typography';
import colors from '../../theme/color';
import { normalize } from '../../utils/responsive';
import { useInfiniteContactsQuery } from '../../hooks/useQueries';
import { Contact } from '../../api/contactsApi';
import Button from '../Button';

interface ContactSelectionModalProps {
  selectedContacts: Contact[];
  onSave: (contacts: Contact[]) => void;
}

const ContactSelectionModal: React.FC<ContactSelectionModalProps> = ({
  selectedContacts,
  onSave,
}) => {
  const themeColors = colors;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Local pending selection — only committed when Save is pressed
  const [pendingContacts, setPendingContacts] = useState<Contact[]>(selectedContacts);

  // Re-sync pending contacts when the bottom sheet opens with updated selectedContacts
  useEffect(() => {
    setPendingContacts(selectedContacts);
  }, [selectedContacts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteContactsQuery(debouncedSearch, 20);

  const allAvailableContacts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const pendingIds = useMemo(() => pendingContacts.map((c) => c.id), [pendingContacts]);

  const toggleContact = useCallback(
    (contact: Contact) => {
      if (pendingIds.includes(contact.id)) {
        setPendingContacts((prev) => prev.filter((c) => c.id !== contact.id));
      } else {
        setPendingContacts((prev) => [...prev, contact]);
      }
    },
    [pendingIds],
  );

  const handleSave = useCallback(() => {
    onSave(pendingContacts);
  }, [onSave, pendingContacts]);

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = pendingIds.includes(item.id);
    return (
      <TouchableOpacity key={item.id} style={styles.contactRow} onPress={() => toggleContact(item)}>
        <View style={styles.contactAvatar}>
          <Typography variant="body2" weight="700" style={{ color: themeColors.primary }}>
            {(item.name || 'U').charAt(0)}
          </Typography>
        </View>
        <View style={styles.contactInfo}>
          <Typography variant="body1" weight="600">
            {item.name || 'Unknown'}
          </Typography>
          <Typography variant="caption" style={{ color: themeColors.gray }}>
            {item.phone_number || item.phone || 'N/A'}
          </Typography>
        </View>
        <View style={[styles.checkboxCircle, isSelected && styles.checkboxCircleActive]}>
          {isSelected && <Check size={normalize(12)} color={themeColors.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.flex1}>
      <View style={styles.container}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Search size={normalize(18)} color={themeColors.gray} />
          <TextInput
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor={themeColors.gray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={normalize(16)} color={themeColors.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Selected count + Clear All */}
        <View style={styles.selectAllRow}>
          <Typography variant="caption" style={{ color: themeColors.gray }}>
            {pendingContacts.length} contacts selected
          </Typography>
          {pendingContacts.length > 0 && (
            <TouchableOpacity onPress={() => setPendingContacts([])}>
              <Typography variant="caption" weight="700" style={{ color: themeColors.error }}>
                Clear All
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <BottomSheetFlatList
          style={styles.flex1}
          data={allAvailableContacts}
          renderItem={renderContact}
          keyExtractor={(item: Contact) => item.id}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={styles.footerLoader} color={themeColors.primary} />
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Typography variant="body2" color={themeColors.gray}>
                  No contacts found
                </Typography>
              </View>
            ) : (
              <ActivityIndicator style={styles.emptyLoader} color={themeColors.primary} />
            )
          }
          contentContainerStyle={styles.contactList}
        />
      </View>
      <View style={styles.saveButtonContainer}>
        <Button
          title={`Save${pendingContacts.length > 0 ? ` (${pendingContacts.length})` : ''}`}
          variant="primary"
          size="medium"
          onPress={handleSave}
          style={styles.saveButton}
          leftIcon={<Check size={normalize(16)} color={themeColors.white} />}
        />
      </View>
    </View>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    flex1: {
      flex: 1,
    },
    container: {
      paddingTop: normalize(16),
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.lightBackground,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: normalize(14),
      paddingHorizontal: normalize(14),
      height: normalize(48),
      marginBottom: normalize(14),
    },
    searchInput: {
      flex: 1,
      height: '100%',
      marginLeft: normalize(8),
      color: themeColors.dark,
      fontSize: normalize(14),
    },
    selectAllRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: normalize(12),
    },
    contactList: {
      paddingBottom: normalize(8),
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: normalize(14),
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    contactAvatar: {
      width: normalize(40),
      height: normalize(40),
      borderRadius: normalize(20),
      backgroundColor: themeColors.primary20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: normalize(12),
    },
    contactInfo: {
      flex: 1,
    },
    checkboxCircle: {
      width: normalize(22),
      height: normalize(22),
      borderRadius: normalize(11),
      borderWidth: 2,
      borderColor: themeColors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxCircleActive: {
      backgroundColor: themeColors.primary,
      borderColor: themeColors.primary,
    },
    footerLoader: {
      margin: normalize(16),
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: normalize(40),
    },
    emptyLoader: {
      marginTop: normalize(40),
    },
    saveButtonContainer: {
      paddingTop: normalize(16),
      paddingBottom: Platform.OS === 'ios' ? normalize(32) : normalize(0),
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      marginTop: 'auto',
    },
    saveButton: {
      width: '100%',
    },
  });
})();

export default ContactSelectionModal;
