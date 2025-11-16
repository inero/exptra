# exptra
Expense Tracker (React Native - Firebase - Expo)


My Recommendation:

   Use EAS Build with this single command:

     eas build -p android --profile preview

   It will:

     - Upload your code to Expo's servers
     - Build the APK in a clean environment
     - Give you a download link
     - Handle all Android SDK/Java/Gradle complexity for you

   This is the fastest and most reliable way to get your APK file!
   
📦 Commands to Generate APK

   Option 1: Using EAS Build (Recommended)

   This builds the APK on Expo's cloud servers:

     # Install EAS CLI if you haven't already
     npm install -g eas-cli
     
     # Login to your Expo account
     eas login
     
     # Build APK using the preview profile
     eas build -p android --profile preview
     
     # Or build for production (AAB format for Play Store)
     eas build -p android --profile production

   Option 2: Local Development Build APK

   For a quick local APK (no cloud build needed):

     # Create a development build APK locally
     npx expo run:android --variant release

   Option 3: Using Expo's Classic Build (Deprecated but simpler)

     # Install expo-cli globally
     npm install -g expo-cli
     
     # Build APK (standalone)
     expo build:android -t apk

   Recommended Steps:

     - First time setup:

     npm install -g eas-cli
     eas login

     - Configure your build (if needed):

     eas build:configure

     - Build the APK:

     eas build -p android --profile preview

     - Download the APK:
       - EAS will provide a download link once the build completes
       - You can also view and download builds at: https://expo.dev/accounts/[your-username]/projects/exptra/builds 
   (https://expo.dev/accounts/[your-username]/projects/exptra/builds)

   What Each Profile Does:

     - preview: Builds an APK file (ready to install on devices)
     - preview2: Uses Gradle's assembleRelease command
     - production: Builds an AAB file (for Google Play Store upload)

   Quick Command (Most Common):

     eas build -p android --profile preview

   This will:

     - Build an installable APK file
     - Show progress in the terminal
     - Provide a download link when complete
     - Allow you to install it directly on Android devices

   The build typically takes 5-15 minutes to complete on EAS servers.