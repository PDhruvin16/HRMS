// @ts-nocheck
// @ts-nocheck
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { X, FileText } from 'lucide-react-native';
import Video from 'react-native-video';
import { Typography } from '../Typography';
import colors from '../../theme/color';
import { normalize, hpRaw, wpRaw } from '../../utils/responsive';

interface FullScreenMediaModalProps {
  visible: boolean;
  onClose: () => void;
  media: {
    uri: string | undefined;
    type: 'image' | 'video' | 'document' | string;
    name?: string;
  } | null;
}

const FullScreenMediaModal: React.FC<FullScreenMediaModalProps> = ({ visible, onClose, media }) => {
  const themeColors = colors;

  if (!media) return null;

  // Simple type detection if not explicitly provided
  const getType = () => {
    if (media?.type === 'image' || media?.type === 'video' || media?.type === 'document') {
      return media?.type;
    }
    if (media?.type?.startsWith('image/')) return 'image';
    if (media?.type?.startsWith('video/')) return 'video';
    return 'document';
  };

  const type = getType();

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <View style={styles.fullScreenOverlay}>
        <TouchableOpacity style={styles.fullScreenClose} onPress={onClose}>
          <X size={normalize(30)} color={themeColors.white} />
        </TouchableOpacity>

        {type === 'image' && media?.uri ? (
          <Image source={{ uri: media?.uri }} style={styles.fullScreenImage} resizeMode="contain" />
        ) : null}

        {type === 'video' && media?.uri ? (
          <View style={styles.fullScreenVideoContainer}>
            <Video
              source={{ uri: media?.uri }}
              style={styles.fullScreenVideo}
              controls
              resizeMode="contain"
            />
          </View>
        ) : null}

        {type === 'document' && (
          <View style={styles.fullScreenDocContainer}>
            <FileText size={normalize(100)} color={themeColors.white} />
            <Typography variant="h5" weight="700" style={styles.fullScreenDocTitle}>
              {media?.name || 'Document'}
            </Typography>
            <Typography variant="body1" style={styles.fullScreenDocText}>
              Document preview not available in this mode.
            </Typography>
            <Typography variant="body2" style={styles.fullScreenDocText}>
              In the actual app, this would open your device's PDF/Doc viewer.
            </Typography>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = (() => {
  const themeColors = colors;
  return StyleSheet.create({
    fullScreenOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullScreenClose: {
      position: 'absolute',
      top: hpRaw(5),
      right: wpRaw(5),
      zIndex: 10,
      padding: normalize(10),
    },
    fullScreenImage: {
      width: '100%',
      height: '80%',
    },
    fullScreenVideoContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
    },
    fullScreenVideo: {
      flex: 1,
      backgroundColor: 'black',
    },
    fullScreenDocContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: normalize(20),
    },
    fullScreenDocTitle: {
      color: themeColors.white,
      marginTop: normalize(20),
      textAlign: 'center',
    },
    fullScreenDocText: {
      color: themeColors.white80,
      marginTop: normalize(12),
      textAlign: 'center',
    },
  });
})();

export default FullScreenMediaModal;
