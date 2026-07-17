import { Alert } from 'react-native';

export const showAlert = (title: string, message?: string): void => {
  Alert.alert(title, message);
};

export default showAlert;
