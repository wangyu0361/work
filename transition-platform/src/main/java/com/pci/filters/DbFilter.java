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
@WebFilter("/db/*")
public class DbFilter implements Filter {

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
		
		HttpServletRequest httpRequest = (HttpServletRequest) req;
		HttpServletResponse httpResponse = (HttpServletResponse) res;
		
		String query = httpRequest.getQueryString() == null ? "" : "?"+httpRequest.getQueryString();
		
		URL url = new URL("10.238.12.215:8080"+httpRequest.getServletPath()+query);
		HttpURLConnection conn = (HttpURLConnection)url.openConnection();

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
	}

	public void init(FilterConfig filterConfig) {}

	public void destroy() {}

}
