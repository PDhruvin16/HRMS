// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Typography } from '../../components/Typography';
import Colors from '../../theme/color';
import { normalize } from '../../utils/responsive';

interface NotificationAlertProps {
  id: string;
  title: string;
  description: string;
  date: string;
  isRead?: boolean;
  type?: 'calendar' | 'bell' | 'mail' | 'alert' | 'success' | 'info';
  category?: 'system' | 'conversation';
  onPress?: () => void;
  onMarkAsRead?: (id: string) => void;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({
  // id,
  title,
  description,
  date,
  isRead = false,
  // type = 'bell',
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.container}>
      {/* Left Icon Circle */}
      <View style={styles.iconContainer}>
        <Bell size={normalize(18)} color={Colors.white} strokeWidth={1.5} />
        {/* If unread, show small red dot on icon circle bottom right or similar? 
            Figma shows a small red dot INSIDE the icon circle background for 'Follow-up Email Sent'. */}
        {!isRead && <View style={styles.unreadBadge} />}
      </View>

      {/* Center/Right Text Block */}
      <View style={styles.textStack}>
        <Typography variant="body1" weight="700" numberOfLines={1} style={styles.titleText}>
          {title}
        </Typography>

        <Typography variant="caption" style={styles.dateText}>
          {date}
        </Typography>

        <Typography variant="body2" numberOfLines={2} style={styles.descText}>
          {description}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteTransparent08,
    backgroundColor: Colors.transparent,
    alignItems: 'flex-start',
    gap: normalize(14),
  },
  iconContainer: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(12),
    backgroundColor: Colors.whiteTransparent10, // Muted white overlay circle like figma
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: normalize(10),
    right: normalize(10),
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: Colors.errorRed, // Red dot
    borderWidth: 1.5,
    borderColor: Colors.whiteTransparent15,
  },
  textStack: {
    flex: 1,
    gap: normalize(3),
  },
  titleText: {
    color: Colors.white,
    fontSize: normalize(14),
    lineHeight: normalize(18),
  },
  dateText: {
    color: Colors.whiteTransparent60, // Muted date text
    fontSize: normalize(11),
    lineHeight: normalize(14),
    marginBottom: normalize(2),
  },
  descText: {
    color: Colors.whiteTransparent50, // Darker grey for paragraph
    fontSize: normalize(12),
    lineHeight: normalize(16),
  },
});

export default NotificationAlert;
