# Android Build Guide — Math Adventure RPG

How to build a signed AAB for Google Play Store. Follow this every time you release a new version.

---

## One-Time Setup (already done — do not repeat)

### 0. Install Android Studio

1. Download from [developer.android.com/studio](https://developer.android.com/studio) (~1 GB)
2. Run the installer — use default options
3. On the **"Components to Install"** screen, **Android Virtual Device (AVD) is optional** — skip it if you don't need an emulator; you can install it later via SDK Manager
4. Wait for Android Studio to finish installing SDK components on first launch

### 1. Install Capacitor

Inside the project folder (`math-adventure-rpg/`):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. Add Android platform

```bash
npm run build
npx cap add android
npx cap sync
```

This generates the `android/` folder — a standard Android Studio Gradle project.

### 3. Open the project in Android Studio

```bash
npx cap open android
```

- Android Studio opens automatically with the `android/` folder loaded
- Do **not** create a new project — Capacitor creates it for you
- Wait for **"Gradle sync finished"** in the bottom status bar (~5–15 min on first open)
- If prompted to **migrate Gradle Daemon Toolchain** or **upgrade Gradle plugin** — click **"Don't show again"** / **"Later"**. Capacitor's generated versions are correct.
- Files open with a **double-click** in the left panel (single-click only selects)

### 4. Create the keystore (done once, keep the .jks file forever)

Run in the project terminal (not Android Studio):

```bash
keytool -genkey -v -keystore math-adventure-rpg-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias math-adventure-rpg
```

Prompts — a single dot (`.`) leaves a field blank, just press Enter to fill normally:

- First and last name: `Sifiso Shezi`
- Organisational unit: `Development`
- Organisation: `Math Adventure RPG`
- City: `Durban`
- State: `KwaZulu-Natal`
- Country code: `ZA`
- Type `yes` to confirm

Set a strong password when prompted. Press **Enter** when asked for the key password to use the same password as the keystore.

Then move the keystore into the Android app folder:

```bash
mv math-adventure-rpg-release.jks android/app/
```

### 5. Configure signing in android/app/build.gradle

Open **`build.gradle (Module :app)`** in Android Studio (double-click it under Gradle Scripts).

Add `signingConfigs` block inside `android {}`, above `buildTypes`, and update `buildTypes`:

```gradle
signingConfigs {
    release {
        storeFile file('math-adventure-rpg-release.jks')
        storePassword 'YOUR_PASSWORD'
        keyAlias 'math-adventure-rpg'
        keyPassword 'YOUR_PASSWORD'
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

> Note: use `proguard-android-optimize.txt` not `proguard-android.txt` — the latter is deprecated in AGP 9.

Click **Sync Now** in Android Studio after saving.

---

## Every Release — Step by Step

### Step 1: Bump the version

In `android/app/build.gradle`, increment `versionCode` by 1 and update `versionName`:

```gradle
versionCode 2          // must increase by at least 1 each upload
versionName "1.1.0"
```

### Step 2: Build and sync

```bash
npm run build
npx cap sync
```

### Step 3: Generate signed AAB in Android Studio

```bash
npx cap open android
```

Then in Android Studio:

1. **Build → Generate Signed Bundle / APK...** (in the top menu bar — File | Edit | View | ... | Build)
2. Select **Android App Bundle** → Next
3. Keystore path: click **Choose Existing** → navigate to `android/app/math-adventure-rpg-release.jks`
   - Key alias: `math-adventure-rpg`
   - Enter your keystore password for both password fields
4. Click **Next** → select build variant: **release**
5. Click **Finish**

Output file location:
```
android/app/release/app-release.aab
```

### Step 4: Upload to Google Play Console

1. Go to [play.google.com/console](https://play.google.com/console)
2. Select **Math Adventure RPG**
3. **Production → Releases → Create new release**
4. Upload `app-release.aab`
5. Add release notes and submit

---

## Keystore Safety

> The `.jks` file + password is the only way to update your app on Play Store.
> If lost, you cannot push updates — you would have to publish a brand new app.

- Back up `math-adventure-rpg-release.jks` to a secure location (USB drive, cloud storage)
- Store the password in a password manager
- Never commit the `.jks` file to a public git repository

---

## VS Code TypeScript Errors (IntelliSense fix)

If red squiggles appear across all `.tsx` files but `npm run lint` passes:

1. `Ctrl+Shift+P` → **TypeScript: Select TypeScript Version**
2. Choose **Use Workspace Version**

This is configured in `.vscode/settings.json` (`typescript.tsdk: node_modules/typescript/lib`).
