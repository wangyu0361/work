package com.pci.filters;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.Collection;
import java.util.Enumeration;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;


/**
 * Servlet Filter implementation class SkysparkFilter
 */
@WebFilter({"/proj/*", "/auth/*", "/host/*", "/pod/*", "/api/*", "/util/*", "/branding/*"})
public class SkysparkFilter implements Filter {

	/**
	 * Default constructor. 
	 */
	public SkysparkFilter() {
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see Filter#destroy()
	 */
	public void destroy() {
		// TODO Auto-generated method stub
	}

	/**
	 * @see Filter#doFilter(ServletRequest, ServletResponse, FilterChain)
	 */
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		// TODO Auto-generated method stub
		// place your code here

		HttpServletRequest httpRequest = (HttpServletRequest) request;
		HttpServletResponse httpResponse = (HttpServletResponse) response;

		/*
		String strippedPath = httpRequest.getServletPath()
				.substring(httpRequest.getServletPath().indexOf("/skyspark")+skysparkContextPath.length());
		
		System.out.println(httpRequest.getServletPath());
		System.out.println(strippedPath);
		*/
		
		String query = httpRequest.getQueryString() == null ? "" : "?"+httpRequest.getQueryString();
		
		URL url = new URL(skysparkUrl+httpRequest.getServletPath()+query);
		HttpURLConnection conn = (HttpURLConnection)url.openConnection();
		conn.setRequestProperty("Authorization", "Basic "+credentials);

		Enumeration<String> requestHeaders = httpRequest.getHeaderNames();
		
		while(requestHeaders.hasMoreElements()){
			String key = requestHeaders.nextElement();
			Enumeration<String> value = httpRequest.getHeaders(key);
			String val = "";
			
			while(value.hasMoreElements()){
				val = val+value.nextElement()+",";
			}
			
			val = val.substring(0, val.lastIndexOf(","));
							
			conn.setRequestProperty(key, val);
		}
		
		if(httpRequest.getMethod().compareTo("GET") == 0){

			Map<String, List<String>> responseHeaders = conn.getHeaderFields();
			Set<String> keySet = responseHeaders.keySet();
			Iterator<String> keyIterator = keySet.iterator();
			
			while(keyIterator.hasNext()){
				String key = keyIterator.next();
				List<String> value = responseHeaders.get(key);
				String val = "";
				
				Iterator<String> valIterator = value.iterator();
				while(valIterator.hasNext()){
					val = val+valIterator.next()+",";
				}
				
				val = val.substring(0, val.lastIndexOf(","));
								
				httpResponse.setHeader(key, val);
			}

			IOUtils.copy(conn.getInputStream(), httpResponse.getOutputStream());
			httpResponse.getOutputStream().flush();
			httpResponse.getOutputStream().close();
			
			httpResponse.setStatus(200);
		}
		else{
			conn.setDoOutput(true);
			conn.setRequestMethod(httpRequest.getMethod());

			IOUtils.copy(httpRequest.getInputStream(), conn.getOutputStream());
			conn.getOutputStream().close();
			conn.getOutputStream().flush();
			
			Map<String, List<String>> responseHeaders = conn.getHeaderFields();
			Set<String> keySet = responseHeaders.keySet();
			Iterator<String> keyIterator = keySet.iterator();
			
			while(keyIterator.hasNext()){
				String key = keyIterator.next();
				List<String> value = responseHeaders.get(key);
				String val = "";
				
				Iterator<String> valIterator = value.iterator();
				while(valIterator.hasNext()){
					val = val+valIterator.next()+",";
				}
				
				val = val.substring(0, val.lastIndexOf(","));

				httpResponse.setHeader(key, val);
			}
			
			IOUtils.copy(conn.getInputStream(), httpResponse.getOutputStream());
			httpResponse.getOutputStream().flush();
			httpResponse.getOutputStream().close();
			
			System.out.println(httpResponse.getHeader("Content-Type"));
			
			httpResponse.setStatus(200);
		}
		// pass the request along the filter chain
		//chain.doFilter(request, response);
	}

	/**
	 * @see Filter#init(FilterConfig)
	 */
	public void init(FilterConfig fConfig) throws ServletException {
		// TODO Auto-generated method stub
	}

	private final String skysparkUrl = "http://10.239.3.165";
	private final String credentials = "c3U6UENJZGV2b3BzKjEyMzQ1Njc4";
	private final String skysparkContextPath = "/skyspark";
}
