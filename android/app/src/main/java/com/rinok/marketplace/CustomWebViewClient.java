package com.rinok.marketplace;

import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;

public class CustomWebViewClient extends WebViewClient {
    private View splashLayout;
    private WebView webView;
    
    public CustomWebViewClient(View splash, WebView web) {
        this.splashLayout = splash;
        this.webView = web;
    }
    
    @Override
    public void onPageFinished(WebView view, String url) {
        splashLayout.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
    }
}