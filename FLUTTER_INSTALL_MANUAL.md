# Flutter Manual Installation - MacBook Air M1

## Step 1: Download & Extract Flutter SDK
```bash
# Buat folder development
mkdir -p ~/development
cd ~/development

# Download Flutter untuk M1 Mac
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.32.8-stable.zip

# Extract
unzip flutter_macos_arm64_3.32.8-stable.zip

# Hapus file zip setelah extract
rm flutter_macos_arm64_3.32.8-stable.zip
```

## Step 2: Add Flutter to PATH
```bash
# Tambahkan ke zsh profile (default macOS)
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc

# Reload terminal
source ~/.zshrc

# Atau restart terminal
```

## Step 3: Verify Installation
```bash
# Check Flutter version
flutter --version

# Run Flutter doctor
flutter doctor
```

## Step 4: Install Dependencies

### Install Xcode Command Line Tools
```bash
xcode-select --install
```

### Accept Xcode License
```bash
sudo xcodebuild -license accept
```

### Install CocoaPods for iOS
```bash
sudo gem install cocoapods
```

## Step 5: Setup Android (Optional)
1. Download Android Studio dari https://developer.android.com/studio
2. Install Android SDK
3. Setup AVD (Android Virtual Device)

## Step 6: Final Check
```bash
flutter doctor

# Output yang diharapkan:
# ✓ Flutter (Channel stable, 3.32.8, on macOS 14.x.x)
# ✓ Android toolchain (jika sudah install Android Studio)
# ✓ Xcode - develop for iOS and macOS
# ✓ Chrome - develop for the web
```

## Step 7: Run Flutter Project
```bash
cd "/Users/user/Documents/Project Web/AntreDokter/antredokter_mobile"
flutter pub get
flutter run
```

## Troubleshooting
- Jika `flutter` command not found: restart terminal atau `source ~/.zshrc`
- Jika error dengan Rosetta: gunakan `arch -arm64 flutter doctor`
- Jika pods error: `arch -x86_64 pod install`

## Quick Test
Untuk test apakah Flutter sudah bekerja:
```bash
flutter create test_app
cd test_app
flutter run
```