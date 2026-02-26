# ColorOS 开启 Hey Google 与 OK Google 语音唤醒

> 本文以**一加13 ColorOS 16** 为例，介绍了开启 Hey Google 与 OK Google 语音唤醒的方法。理论上适用于一加其他机型、真我（realme）、OPPO 设备。  
> ⚠️ **注意**：本文仅适用于开启 Google 语音唤醒功能，“圈定即搜”与“侧滑唤醒”请参考其他教程。  
> ⚠️ **需要 Root 权限**。


## 1. 下载 Google 应用

在 [Google Play Store](https://play.google.com/store) 下载并安装 **Google** 应用。

![Google 应用图标](https://vip.123pan.cn/1812581465/yk6baz03t0n000dc4yko4z608fs98bb0DIYPDqJ1DIFzAGxxDIrP.png)

## 2. 下载 Gemini 应用

在 Google Play Store 下载并安装 **Gemini** 应用。

> 如果你所在的国家或地区无法从 Play Store 下载 Gemini，请自行寻找可信渠道安装。  
> 可参考 Google 官方支持文档*可以从 Google Play 商店下载 Gemini 应用的国家/地区*：[Where you can download the Gemini app from the Google Play Store](https://support.google.com/gemini/answer/14579026?#zippy=%2Cwhere-you-can-download-the-gemini-app-from-the-google-play-store)

![Gemini 应用图标](https://vip.123pan.cn/1812581465/ymjew503t0n000dc4q3de48396ngnrzlDIYPDqJ1DIFzAGxxDIrP.png)

## 3. 测试 Gemini 基础功能

打开 Gemini 应用，测试除语音唤醒外的其他功能（如文字对话、联网搜索等）是否正常。确认功能正常后，再进行后续步骤。

## 4. 将 Google 和 Gemini 转为系统应用

> Android 的 `/system` 分区默认是只读的，这是为了保护系统完整性。要修改系统文件，需要先获取写入权限。

将 **Google** 和 **Gemini** 应用转为系统应用：

- **Google 应用**推荐路径：`/system/product/priv-app/`
- **Gemini 应用**推荐路径：`/system/product/app/`

固化完成后，你应在应用详情页看到类似下图的状态：

![Google 系统应用示例](https://vip.123pan.cn/1812581465/ymjew503t0l000dc4qjgjyeaesnkcanoDIYPDqJ1DIFzAGxxDIrP.jpg)  
![Gemini 系统应用示例](https://vip.123pan.cn/1812581465/yk6baz03t0l000dc4z153frkwnsd6ox2DIYPDqJ1DIFzAGxxDIrP.jpg)

## 5. 安装 Hotword 应用

下载并安装以下两个 Hotword 应用：

- [Hey Google Hotword](https://download.im-a.gay/single-apk/HotwordEnrollmentXGoogleHEXAGON_WIDEBAND.apk)
- [OK Google Hotword](https://download.im-a.gay/single-apk/HotwordEnrollmentYGoogleHEXAGON_WIDEBAND.apk)

> 如果安装时提示“不兼容”，请继续下一步，完成后通常可以解决。

## 6. 将 Hotword 应用转为系统应用

将两个 Hotword 应用也转为系统应用：

- 推荐路径：`/system/product/priv-app/`

固化完成后，你应在应用详情页看到类似下图的状态：

![Hey Google Hotword 系统应用示例](https://vip.123pan.cn/1812581465/yk6baz03t0n000dc4z3b8oh6iuse5z6sDIYPDqJ1DIFzAGxxDIrP.png)  
![OK Google Hotword 系统应用示例](https://vip.123pan.cn/1812581465/ymjew503t0n000dc4qpfogwr3onlqsphDIYPDqJ1DIFzAGxxDIrP.png)

## 7. 重启设备

按照手机的正常方式重启，使改动生效。

## 8. 在 Gemini 中开启语音唤醒

打开 **Gemini 应用** → 进入 **设置** → 找到 **“无需动手打字，轻松与 Gemini 对话”** → 开启 **语音唤醒**。

![Gemini 语音唤醒设置](https://vip.123pan.cn/1812581465/ymjew503t0l000dc4qtk555ahznmoirqDIYPDqJ1DIFzAGxxDIrP.png)

## 一键模块（KernelSU）

如果你希望更便捷地完成上述操作，可以下载并刷入以下 KernelSU 模块：  
[**点此下载 EnableGoogleGemini.zip**](https://download.im-a.gay/EnableGoogleGemini.zip)

## 附：自行制作模块参考

如果你需要自己制作模块，可以参考以下内容：

### 安装脚本示例
```bash
#!/system/bin/sh
MODDIR=${0%/*}

ui_print() { echo "$1"; }

cp -r $MODPATH/system/product/app/* /data/local/tmp/gmn/
cp -r $MODPATH/system/product/priv-app/* /data/local/tmp/gmn/
ui_print "Installing apps, please wait ..."
pm install -r /data/local/tmp/gmn/HeyGoogle.apk
pm install -r /data/local/tmp/gmn/OKGoogle.apk
rm -rf /data/local/tmp/gmn/*
rm -rf /data/system/package_cache/* 2>/dev/null
```

### 权限配置文件示例
```xml
<?xml version="1.0" encoding="utf-8"?>
<permissions>
    <privapp-permissions package="com.google.android.googlequicksearchbox">
        <permission name="android.permission.BIND_APPWIDGET"/>
        <permission name="android.permission.CALL_PRIVILEGED"/>
        <permission name="android.permission.CAPTURE_AUDIO_HOTWORD"/>
        <!-- 更多权限省略，详见原文 -->
    </privapp-permissions>

    <privapp-permissions package="com.android.hotwordenrollment.okgoogle">
        <permission name="android.permission.KEYPHRASE_ENROLLMENT_APPLICATION"/>
        <permission name="android.permission.INTERACT_ACROSS_USERS"/>
    </privapp-permissions>

    <privapp-permissions package="com.android.hotwordenrollment.xgoogle">
        <permission name="android.permission.KEYPHRASE_ENROLLMENT_APPLICATION"/>
        <permission name="android.permission.INTERACT_ACROSS_USERS"/>
    </privapp-permissions>	
</permissions>
```

### 隐藏 API 白名单示例
```xml
<?xml version="1.0" encoding="utf-8"?>
<config>
  <hidden-api-whitelisted-app package="com.android.hotwordenrollment.okgoogle" />
  <hidden-api-whitelisted-app package="com.android.hotwordenrollment.tgoogle" />
  <hidden-api-whitelisted-app package="com.android.hotwordenrollment.xgoogle" />
</config>
```