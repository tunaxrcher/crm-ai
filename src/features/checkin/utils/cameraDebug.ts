/**
 * Camera Debug Utilities for iOS Safari
 */

export const debugCameraIssue = () => {
  const debugInfo: any = {
    userAgent: navigator.userAgent,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isSecureContext: window.isSecureContext,
    hasMediaDevices: !!navigator.mediaDevices,
    hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
  }

  // Check iOS version
  const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/)
  if (match) {
    debugInfo.iOSVersion = `${match[1]}.${match[2]}.${match[3] || 0}`
  }

  console.log('Camera Debug Info:', debugInfo)
  
  return debugInfo
}

export const testCameraAccess = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')
    console.log('Available video devices:', videoDevices)
    
    if (videoDevices.length === 0) {
      console.error('No video devices found')
      return false
    }
    
    // Try to get camera stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })
    
    console.log('Camera stream obtained successfully')
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => track.stop())
    
    return true
  } catch (error) {
    console.error('Camera test failed:', error)
    return false
  }
}

// iOS Safari specific fixes
export const applyIOSFixes = (videoElement: HTMLVideoElement) => {
  if (!videoElement) return

  // Set all required attributes
  videoElement.setAttribute('autoplay', 'true')
  videoElement.setAttribute('playsinline', 'true')
  videoElement.setAttribute('webkit-playsinline', 'true')
  videoElement.setAttribute('muted', 'true')
  
  // Apply iOS specific styles
  videoElement.style.position = 'absolute'
  videoElement.style.top = '0'
  videoElement.style.left = '0'
  videoElement.style.width = '100%'
  videoElement.style.height = '100%'
  videoElement.style.objectFit = 'cover'
  videoElement.style.transform = 'translateZ(0)' // Hardware acceleration
  videoElement.style.webkitTransform = 'translateZ(0)'
  
  // Prevent iOS zoom
  videoElement.style.touchAction = 'none'
  
  console.log('iOS fixes applied to video element')
}

// Check if running on iOS Safari
export const isIOSSafari = () => {
  const ua = window.navigator.userAgent
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i)
  const webkit = !!ua.match(/WebKit/i)
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/FxiOS/i)
  
  return iOSSafari
} 