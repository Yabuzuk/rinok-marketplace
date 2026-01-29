package com.rinok.marketplace;

import android.content.Intent;
import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

public class CustomWebChromeClient extends WebChromeClient {
    private MainActivity activity;
    private final int FILE_CHOOSER_REQUEST_CODE = 1;
    
    public CustomWebChromeClient(MainActivity activity) {
        this.activity = activity;
    }
    
    @Override
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        activity.setFilePathCallback(filePathCallback);
        
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("image/*");
        
        activity.startActivityForResult(Intent.createChooser(intent, "Выберите файл"), FILE_CHOOSER_REQUEST_CODE);
        return true;
    }
}