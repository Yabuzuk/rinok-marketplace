package com.rinok.marketplace;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.view.View;

public class MainActivity extends Activity {
    private WebView webView;
    private View splashLayout;
    private ValueCallback<Uri[]> filePathCallback;
    private final int FILE_CHOOSER_REQUEST_CODE = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        webView = findViewById(R.id.webview);
        splashLayout = findViewById(R.id.splash_layout);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        CustomWebViewClient client = new CustomWebViewClient(splashLayout, webView);
        webView.setWebViewClient(client);
        
        CustomWebChromeClient chromeClient = new CustomWebChromeClient(this);
        webView.setWebChromeClient(chromeClient);
        
        splashLayout.setVisibility(View.VISIBLE);
        webView.setVisibility(View.GONE);
        
        webView.loadUrl("https://asia-sib.web.app");
    }
    
    public void setFilePathCallback(ValueCallback<Uri[]> callback) {
        this.filePathCallback = callback;
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        }
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}