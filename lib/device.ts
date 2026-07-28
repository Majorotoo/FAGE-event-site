// Device detection utilities

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  screenResolution: string;
}

export function getDeviceInfo(): DeviceInfo {
  const userAgent = navigator.userAgent;
  
  // Detect device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android|Tablet/i.test(userAgent) && !/Mobile/i.test(userAgent);
  
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (isTablet) deviceType = 'tablet';
  else if (isMobile) deviceType = 'mobile';

  // Detect browser
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  else if (userAgent.includes('Opera')) browser = 'Opera';

  // Get platform
  let platform = navigator.platform || 'Unknown';

  // Get screen resolution
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    userAgent,
    platform,
    browser,
    deviceType,
    screenResolution
  };
}

export function formatDeviceInfo(device: DeviceInfo): string {
  return `${device.browser} on ${device.platform} (${device.deviceType}) - ${device.screenResolution}`;
}
