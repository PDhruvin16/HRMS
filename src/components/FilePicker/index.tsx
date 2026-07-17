// @ts-nocheck
// @ts-nocheck
import React, { useState } from 'react';
import { Platform, ActionSheetIOS, TouchableOpacity, View, Image, StyleSheet } from 'react-native';
import { pick, types, isCancel, type DocumentPickerResponse } from '@react-native-documents/picker';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { Typography } from '../Typography';
import Popup from '../Popup';
import AppBottomSheet, { type ActionSheetOption } from '../BottomSheet';
import { colors } from '../../theme/color';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export interface FileItem {
  uri: string;
  type: string;
  name: string;
  fileSize?: number;
}

interface FilePickerProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  accept?: string[]; // e.g., ['image/*', 'application/pdf']
  maxFiles?: number;
  minFiles?: number;
  maxFileSizeMB?: number; // Added for validation
  maxTotalSizeMB?: number; // Added for validation
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  allowMultiple?: boolean;
  showPreview?: boolean;
  onRemove?: (index: number) => void;
  maxFileNameLength?: number; // Added for validation
}

interface PopupState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

const FilePicker: React.FC<FilePickerProps> = ({
  label,
  required = false,
  placeholder = 'Select files',
  accept = ['image/*'],
  maxFiles = 1,
  minFiles = 0,
  maxFileSizeMB,
  maxTotalSizeMB,
  files = [],
  onFilesChange,
  allowMultiple = false,
  showPreview = true,
  onRemove,
  maxFileNameLength,
}) => {
  const [popupState, setPopupState] = useState<PopupState>({
    isOpen: false,
    title: '',
    message: '',
  });
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const isImageOnly = accept.every((type) => type === 'image/*' || type.startsWith('image/'));
  const allowPDF = accept.some((type) => type === 'application/pdf' || type === 'pdf');
  const allowImages = accept.some((type) => type === 'image/*' || type.startsWith('image/'));

  const showImagePickerOptions = () => {
    if (Platform.OS === 'ios') {
      const options = ['Cancel'];
      if (allowImages) {
        options.push('Take Photo', 'Choose from Gallery');
      }
      if (allowPDF) {
        options.push('Choose PDF');
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return; // Cancel
          if (allowImages) {
            if (buttonIndex === 1) {
              openCamera();
            } else if (buttonIndex === 2) {
              openGallery();
            } else if (buttonIndex === 3 && allowPDF) {
              openDocumentPicker();
            }
          } else if (allowPDF && buttonIndex === 1) {
            openDocumentPicker();
          }
        },
      );
    } else {
      // Show custom action sheet for Android
      setActionSheetVisible(true);
    }
  };

  const closeActionSheet = () => {
    setActionSheetVisible(false);
  };

  const getActionSheetOptions = (): ActionSheetOption[] => {
    const options: ActionSheetOption[] = [];

    if (allowImages) {
      options.push(
        {
          label: 'Take Photo',
          onPress: openCamera,
        },
        {
          label: 'Choose from Gallery',
          onPress: openGallery,
        },
      );
    }

    if (allowPDF) {
      options.push({
        label: 'Choose PDF',
        onPress: openDocumentPicker,
      });
    }

    return options;
  };

  const openCamera = () => {
    if (files.length >= maxFiles) {
      setPopupState({
        isOpen: true,
        title: 'Limit Reached',
        message: `Maximum ${maxFiles} file(s) allowed.`,
        confirmLabel: 'OK',
        cancelLabel: undefined,
        onConfirm: () => {
          setPopupState({ isOpen: false, title: '', message: '' });
        },
      });
      return;
    }

    launchCamera(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        saveToPhotos: false,
      },
      (response: ImagePickerResponse) => {
        handleImagePickerResponse(response);
      },
    );
  };

  const openGallery = () => {
    if (files.length >= maxFiles) {
      setPopupState({
        isOpen: true,
        title: 'Limit Reached',
        message: `Maximum ${maxFiles} file(s) allowed.`,
        confirmLabel: 'OK',
        cancelLabel: undefined,
        onConfirm: () => {
          setPopupState({ isOpen: false, title: '', message: '' });
        },
      });
      return;
    }

    const selectionLimit = allowMultiple ? maxFiles - files.length : 1;

    launchImageLibrary(
      {
        mediaType: 'photo' as MediaType,
        quality: 0.8,
        selectionLimit,
      },
      (response: ImagePickerResponse) => {
        handleImagePickerResponse(response);
      },
    );
  };

  const openDocumentPicker = async () => {
    if (files.length >= maxFiles) {
      setPopupState({
        isOpen: true,
        title: 'Limit Reached',
        message: `Maximum ${maxFiles} file(s) allowed.`,
        confirmLabel: 'OK',
        cancelLabel: undefined,
        onConfirm: () => {
          setPopupState({ isOpen: false, title: '', message: '' });
        },
      });
      return;
    }

    try {
      const maxSelection = allowMultiple ? maxFiles - files.length : 1;
      const pickerResult = await pick({
        type: [types.pdf],
        allowMultiSelection: allowMultiple && maxSelection > 1,
      });

      if (pickerResult && pickerResult.length > 0) {
        const selectedDocs = pickerResult as DocumentPickerResponse[];
        const totalExistingSize = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
        let currentTotalSize = totalExistingSize;

        const newFiles: FileItem[] = [];
        for (const doc of selectedDocs) {
          if (newFiles.length + files.length >= maxFiles) break;

          // Size Validation
          const docSize = doc.size ?? 0;
          if (maxFileSizeMB && docSize > maxFileSizeMB * 1024 * 1024) {
            setPopupState({
              isOpen: true,
              title: 'File Too Large',
              message: `File "${doc.name}" exceeds the ${maxFileSizeMB} MB limit.`,
              confirmLabel: 'OK',
            });
            continue;
          }

          // Total Size Validation
          if (maxTotalSizeMB && currentTotalSize + docSize > maxTotalSizeMB * 1024 * 1024) {
            setPopupState({
              isOpen: true,
              title: 'Total Size Limit',
              message: `Total upload size would exceed ${maxTotalSizeMB} MB.`,
              confirmLabel: 'OK',
            });
            break;
          }

          // Filename Length Validation
          if (maxFileNameLength && (doc.name || '').length > maxFileNameLength) {
            setPopupState({
              isOpen: true,
              title: 'Filename Too Long',
              message: `Filename "${doc.name}" is too long (max ${maxFileNameLength} characters).`,
              confirmLabel: 'OK',
            });
            continue;
          }

          newFiles.push({
            uri: doc.uri,
            type: doc.mimeType || doc.type || 'application/pdf',
            name: doc.name || `document_${Date.now()}.pdf`,
            fileSize: docSize,
          });
          currentTotalSize += docSize;
        }

        if (newFiles.length > 0) {
          const updatedFiles = allowMultiple ? [...files, ...newFiles] : newFiles;
          const limitedFiles = updatedFiles.slice(0, maxFiles);
          onFilesChange(limitedFiles);
        }
      }
    } catch (err) {
      if (isCancel(err)) {
        // User cancelled the picker
        return;
      }
      // Handle error
      setPopupState({
        isOpen: true,
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to pick document. Please try again.',
        confirmLabel: 'OK',
        cancelLabel: undefined,
        onConfirm: () => {
          setPopupState({ isOpen: false, title: '', message: '' });
        },
      });
    }
  };

  const handleImagePickerResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      if (response.errorMessage) {
        setPopupState({
          isOpen: true,
          title: 'Error',
          message: response.errorMessage,
          confirmLabel: 'OK',
          cancelLabel: undefined,
          onConfirm: () => {
            setPopupState({ isOpen: false, title: '', message: '' });
          },
        });
      }
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const totalExistingSize = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);
      let currentTotalSize = totalExistingSize;

      const newFiles: FileItem[] = [];
      for (const asset of response.assets) {
        if (newFiles.length + files.length >= maxFiles) break;
        if (!asset.uri) continue;

        // Filter based on accept types
        const isAllowed =
          (allowPDF && allowImages) ||
          (allowPDF && (asset.type === 'application/pdf' || asset.uri.endsWith('.pdf'))) ||
          (!allowPDF && (asset.type?.startsWith('image/') || !asset.type));

        if (!isAllowed) continue;

        // Size Validation
        const assetSize = asset.fileSize ?? 0;
        if (maxFileSizeMB && assetSize > maxFileSizeMB * 1024 * 1024) {
          setPopupState({
            isOpen: true,
            title: 'File Too Large',
            message: `File "${asset.fileName}" exceeds the ${maxFileSizeMB} MB limit.`,
            confirmLabel: 'OK',
          });
          continue;
        }

        // Total Size Validation
        if (maxTotalSizeMB && currentTotalSize + assetSize > maxTotalSizeMB * 1024 * 1024) {
          setPopupState({
            isOpen: true,
            title: 'Total Size Limit',
            message: `Total upload size would exceed ${maxTotalSizeMB} MB.`,
            confirmLabel: 'OK',
          });
          break;
        }

        // Filename Length Validation
        if (maxFileNameLength && (asset.fileName || '').length > maxFileNameLength) {
          setPopupState({
            isOpen: true,
            title: 'Filename Too Long',
            message: `Filename "${asset.fileName}" is too long (max ${maxFileNameLength} characters).`,
            confirmLabel: 'OK',
          });
          continue;
        }

        newFiles.push({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name:
            asset.fileName || `file_${Date.now()}.${asset.type?.includes('pdf') ? 'pdf' : 'jpg'}`,
          fileSize: assetSize,
        });
        currentTotalSize += assetSize;
      }

      if (newFiles.length > 0) {
        const updatedFiles = allowMultiple ? [...files, ...newFiles] : newFiles;
        const limitedFiles = updatedFiles.slice(0, maxFiles);
        onFilesChange(limitedFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles);
    }
  };

  const isImage = (file: FileItem) => {
    return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.uri);
  };

  const isPDF = (file: FileItem) => {
    return file.type === 'application/pdf' || file.uri.endsWith('.pdf');
  };

  const renderFilePreview = (file: FileItem) => {
    if (isImage(file)) {
      return <Image source={{ uri: file.uri }} style={styles.filePreview} resizeMode="cover" />;
    } else if (isPDF(file)) {
      return (
        <View style={[styles.filePreview, styles.pdfPreview]}>
          <Typography variant="h2" style={styles.pdfIcon}>
            📄
          </Typography>
          <Typography variant="caption" style={styles.pdfLabel} numberOfLines={1}>
            PDF
          </Typography>
        </View>
      );
    } else {
      return (
        <View style={[styles.filePreview, styles.unknownPreview]}>
          <Typography variant="caption" style={styles.unknownLabel}>
            File
          </Typography>
        </View>
      );
    }
  };

  const countText =
    maxFiles > 1
      ? `${files.length}/${maxFiles} file(s)${
          minFiles > 0 ? ` (minimum ${minFiles} required)` : ''
        }`
      : files.length > 0
      ? '1 file selected'
      : 'No file selected';

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="body1" style={styles.label}>
          {label}
          {required && (
            <Typography variant="body1" style={styles.required}>
              {' '}
              *
            </Typography>
          )}
        </Typography>
      )}

      {showPreview && files.length > 0 && (
        <View style={styles.filesGrid}>
          {files.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              {renderFilePreview(file)}
              <TouchableOpacity style={styles.removeButton} onPress={() => removeFile(index)}>
                <Typography variant="caption" style={styles.removeText}>
                  ×
                </Typography>
              </TouchableOpacity>
              {!isImage(file) && (
                <View style={styles.fileNameContainer}>
                  <Typography variant="caption" style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Typography>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {files.length < maxFiles && (
        <TouchableOpacity style={styles.uploadButton} onPress={showImagePickerOptions}>
          <Typography variant="h2" style={styles.uploadIcon}>
            {allowPDF && !isImageOnly ? '📎' : '📷'}
          </Typography>
          <Typography variant="caption" style={styles.uploadText}>
            {placeholder}
          </Typography>
          {maxFiles > 1 && (
            <Typography variant="caption" style={styles.uploadCounter}>
              {countText}
            </Typography>
          )}
        </TouchableOpacity>
      )}

      {files.length >= minFiles && files.length < maxFiles && maxFiles > 1 && (
        <TouchableOpacity
          style={[styles.uploadButton, styles.uploadButtonSecondary]}
          onPress={showImagePickerOptions}
        >
          <Typography variant="caption" style={styles.uploadText}>
            Add More Files
          </Typography>
        </TouchableOpacity>
      )}

      {/* Popup for error messages */}
      <Popup
        isOpen={popupState.isOpen}
        onClose={() => {
          setPopupState({ isOpen: false, title: '', message: '' });
        }}
        onConfirm={() => {
          if (popupState.onConfirm) {
            popupState.onConfirm();
          } else {
            setPopupState({ isOpen: false, title: '', message: '' });
          }
        }}
        title={popupState.title}
        message={popupState.message}
        confirmLabel={popupState.confirmLabel}
        cancelLabel={popupState.cancelLabel}
      />

      {/* Action Sheet for Android */}
      <AppBottomSheet
        visible={actionSheetVisible}
        onClose={closeActionSheet}
        title="Select File"
        subtitle="Choose an option"
        options={getActionSheetOptions()}
        cancelLabel="Cancel"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    fontSize: typography.body,
    color: colors.convoDark || '#1C1C1E',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  required: {
    color: colors.errorRed || colors.error,
  },
  filesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  fileItem: {
    width: 100,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    position: 'relative',
  },
  filePreview: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.lightBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pdfPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBackground,
  },
  pdfIcon: {
    fontSize: typography.h1,
    marginBottom: spacing.xs,
  },
  pdfLabel: {
    color: colors.convoDark || '#1C1C1E',
    fontWeight: '600',
  },
  unknownPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBackground,
  },
  unknownLabel: {
    color: colors.text.secondary || '#8E8E93',
  },
  fileNameContainer: {
    marginTop: spacing.xs,
  },
  fileName: {
    fontSize: typography.caption,
    color: colors.convoDark || '#1C1C1E',
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.errorRed || colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    zIndex: 1,
  },
  removeText: {
    color: colors.white,
    fontSize: typography.h2,
    fontWeight: '700',
    lineHeight: typography.h2,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBackground,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  uploadButtonSecondary: {
    marginTop: spacing.sm,
    backgroundColor: colors.lightBackground,
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: typography.h1,
    marginBottom: spacing.xs,
  },
  uploadText: {
    fontSize: typography.body,
    color: colors.convoDark || '#1C1C1E',
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  uploadCounter: {
    fontSize: typography.caption,
    color: colors.text.secondary || '#8E8E93',
  },
});

export default FilePicker;
