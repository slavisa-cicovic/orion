package com.slavisa3193.betelgeuse.modules

import android.content.pm.PackageManager
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppPackageManagerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AppPackageManager"

    @ReactMethod
    fun isAppInstalled(packageName: String, promise: Promise) {
        if (packageName.isBlank()) {
            promise.resolve(false)
            return
        }

        val packageManager = reactApplicationContext.packageManager
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    packageName,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0)
            }
            promise.resolve(true)
        } catch (_: PackageManager.NameNotFoundException) {
            promise.resolve(false)
        } catch (ex: Exception) {
            promise.reject("APP_CHECK_FAILED", ex)
        }
    }
}
