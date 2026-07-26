import DeviceInfo from 'react-native-device-info';

export const getAppVersion = (): string => DeviceInfo.getVersion();
