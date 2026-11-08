# Build and install native Apex Gamer APK onto connected mobile phone
$ErrorActionPreference = "Stop"

$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$buildTools = "$sdk\build-tools\35.0.0"
$platformJar = "$sdk\platforms\android-36\android.jar"
$jbr = "C:\Program Files\Android\Android Studio\jbr"
$env:JAVA_HOME = $jbr
$env:PATH = "$jbr\bin;$buildTools;$sdk\platform-tools;$env:PATH"

$javac = "$jbr\bin\javac.exe"
$jar = "$jbr\bin\jar.exe"
$keytool = "$jbr\bin\keytool.exe"
$adb = "$sdk\platform-tools\adb.exe"

$aapt2 = "$buildTools\aapt2.exe"
$d8 = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksigner = "$buildTools\apksigner.bat"

$workDir = "C:\Users\Admin\OneDrive\Documents\Apexgaming\ApexGamingCafe\ApexGamingCafeWeb\apk-builder"
if (Test-Path $workDir) { Remove-Item -Path $workDir -Recurse -Force }
New-Item -ItemType Directory -Path "$workDir\res\values" -Force | Out-Null
New-Item -ItemType Directory -Path "$workDir\res\mipmap-xxhdpi" -Force | Out-Null
New-Item -ItemType Directory -Path "$workDir\src\com\apexgaming\customer" -Force | Out-Null
New-Item -ItemType Directory -Path "$workDir\bin" -Force | Out-Null
New-Item -ItemType Directory -Path "$workDir\obj" -Force | Out-Null

# 1. Strings.xml
$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Apex Gamer</string>
</resources>
"@
[System.IO.File]::WriteAllText("$workDir\res\values\strings.xml", $stringsXml)

# 2. Icon
Copy-Item "C:\Users\Admin\OneDrive\Documents\Apexgaming\ApexGamingCafe\ApexGamingCafe\logo.png" -Destination "$workDir\res\mipmap-xxhdpi\ic_launcher.png" -Force

# 3. AndroidManifest.xml
$manifestXml = @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.apexgaming.customer"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@
[System.IO.File]::WriteAllText("$workDir\AndroidManifest.xml", $manifestXml)

# 4. MainActivity.java
$mainActivityJava = @"
package com.apexgaming.customer;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.parseColor("#000000"));
        window.setNavigationBarColor(Color.parseColor("#000000"));

        webView = new WebView(this);
        setContentView(webView);
        webView.setBackgroundColor(Color.parseColor("#000000"));

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadsImagesAutomatically(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(true);
        s.setUserAgentString(s.getUserAgentString() + " ApexGamerApp/1.0");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient());
        webView.loadUrl("https://apex-gamer-web.onrender.com");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"@
[System.IO.File]::WriteAllText("$workDir\src\com\apexgaming\customer\MainActivity.java", $mainActivityJava)

Write-Output "1. Compiling Android resources with aapt2..."
& $aapt2 compile --dir "$workDir\res" -o "$workDir\obj\res.zip"

Write-Output "2. Linking resources and generating R.java..."
& $aapt2 link -I $platformJar `
    --manifest "$workDir\AndroidManifest.xml" `
    --java "$workDir\src" `
    -o "$workDir\bin\unaligned.apk" `
    "$workDir\obj\res.zip"

Write-Output "3. Compiling Java sources..."
$javaFiles = Get-ChildItem -Path "$workDir\src" -Recurse -Filter "*.java" | Select-Object -ExpandProperty FullName
& $javac -cp $platformJar -source 11 -target 11 -d "$workDir\obj" $javaFiles

Write-Output "4. Building DEX with d8..."
$classFiles = Get-ChildItem -Path "$workDir\obj" -Recurse -Filter "*.class" | Select-Object -ExpandProperty FullName
& cmd /c "$d8 --lib `"$platformJar`" --min-api 24 --output `"$workDir\bin`" $classFiles"

Write-Output "5. Adding classes.dex to APK with jar..."
Push-Location "$workDir\bin"
& $jar uf "$workDir\bin\unaligned.apk" classes.dex
Pop-Location

Write-Output "6. Aligning APK with zipalign..."
& $zipalign -v -p 4 "$workDir\bin\unaligned.apk" "$workDir\bin\aligned.apk" | Out-Null

# 7. Create permanent debug keystore if needed
$keystore = "C:\Users\Admin\OneDrive\Documents\Apexgaming\ApexGamingCafe\ApexGamingCafeWeb\debug.keystore"
if (-not (Test-Path $keystore)) {
    Write-Output "Generating persistent debug keystore..."
    & $keytool -genkey -v -keystore $keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" | Out-Null
}

Write-Output "7. Signing APK with apksigner..."
& cmd /c "$apksigner sign --ks `"$keystore`" --ks-pass pass:android --ks-key-alias androiddebugkey --out `"$workDir\bin\ApexGamer.apk`" `"$workDir\bin\aligned.apk`""

Write-Output "APK built successfully: $workDir\bin\ApexGamer.apk"

# Copy to web public folders for direct mobile browser download
$rootWeb = "C:\Users\Admin\OneDrive\Documents\Apexgaming\ApexGamingCafe\ApexGamingCafeWeb"
Copy-Item "$workDir\bin\ApexGamer.apk" -Destination "$rootWeb\frontend\public\ApexGamer.apk" -Force
Copy-Item "$workDir\bin\ApexGamer.apk" -Destination "$rootWeb\admin-portal\public\ApexGamer.apk" -Force
Write-Output "Copied ApexGamer.apk to frontend and admin-portal public directories."

try {
    Write-Output "8. Checking ADB for connected device..."
    $devices = & $adb devices
    if ($devices -match "device\b") {
        Write-Output "Installing ApexGamer.apk onto connected phone via ADB..."
        & $adb uninstall com.apexgaming.customer | Out-Null
        & $adb push "$workDir\bin\ApexGamer.apk" /data/local/tmp/ApexGamer.apk
        & $adb shell pm install -r -d -g /data/local/tmp/ApexGamer.apk
        Write-Output "9. Launching Apex Gamer app on phone..."
        & $adb shell am start -n com.apexgaming.customer/.MainActivity
        Write-Output "=== APEX GAMER APP SUCCESSFULLY INSTALLED AND LAUNCHED ON DEVICE! ==="
    } else {
        Write-Output "No physical phone connected via ADB. Direct APK ready for web download!"
    }
} catch {
    Write-Output "ADB install step bypassed."
}
