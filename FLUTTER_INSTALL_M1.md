# Flutter Installation for MacBook Air M1

## Method 1: Manual Download (Recommended)

### Step 1: Download Flutter SDK
```bash
# Buat directory untuk development tools
mkdir -p ~/development

# Download Flutter SDK untuk M1 Mac
cd ~/development
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_arm64_3.32.8-stable.zip

# Extract file
unzip flutter_macos_arm64_3.32.8-stable.zip
```

### Step 2: Add Flutter to PATH
```bash
# Edit shell profile (pilih sesuai shell yang digunakan)
# Untuk zsh (default macOS):
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc

# Untuk bash:
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.bash_profile

# Reload terminal atau jalankan:
source ~/.zshrc  # atau source ~/.bash_profile
```

### Step 3: Verify Installation
```bash
# Check Flutter version
flutter --version

# Run Flutter doctor untuk check dependencies
flutter doctor
```

## Method 2: Using Git (Alternative)
```bash
cd ~/development
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
echo 'export PATH="$PATH:$HOME/development/flutter/bin"' >> ~/.zshrc
```

## Additional Dependencies for M1 Mac

### Install Xcode Command Line Tools
```bash
xcode-select --install
```

### Accept Xcode License
```bash
sudo xcodebuild -license accept
```

### Install CocoaPods (for iOS development)
```bash
sudo gem install cocoapods
```

### For Android Development
1. Download Android Studio: https://developer.android.com/studio
2. Install Android SDK dan AVD
3. Add Android SDK to PATH:
```bash
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/tools/bin' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
```

## Final Check
```bash
# Restart terminal dan jalankan
flutter doctor

# Semua checklist harus ✓ (hijau)
# Jika ada ✗ (merah), ikuti instruksi yang diberikan
```

## Run Flutter Project
```bash
cd /Users/user/Documents/Project\ Web/AntreDokter/antredokter_mobile
flutter pub get
flutter run
```

## Troubleshooting M1 Mac
- Pastikan menggunakan ARM64 version untuk M1
- Jika ada error dengan pods, gunakan: `arch -x86_64 pod install`
- Untuk emulator Android, gunakan ARM64 images