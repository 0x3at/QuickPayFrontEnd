// lib/api-client.ts

import { errorToast } from "@/lib/utils";

// Use relative path in production, full URL in development
const API_BASE_URL = 'http://127.0.0.1:8000/quickpay/api';  // In development, use full URL

// Type for request options
type ApiOptions = {
    method?: 'GET' | 'POST';
    body?: any;  // Data to send in request body
    headers?: Record<string, string>;  // Additional headers
    fallbackData?: any;  // Data to return if request fails
}

// Generic fetch function that handles errors and typing
export async function apiRequest<T>(
    endpoint: string,  // The API endpoint path (e.g., '/client/salespeople')
    options: ApiOptions = {}  // Request options with defaults
): Promise<T> {
    const {
        method = 'GET',  // Default to GET
        body,
        headers = {},
        fallbackData
    } = options;

    try {
        // Build request options
        const requestOptions: RequestInit = {
            method,
            // Add credentials to include cookies in the request
            headers: {
                'Content-Type': 'application/json',
                ...headers  // Allow overriding headers
            },
            ...(body && { body: JSON.stringify(body) })  // Only add body if provided
        };

        // Make the actual fetch request
        const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);

        // Handle non-200 responses
        if (!response.ok) {
            const payload = await response.json() ?? {'error': 'Unknown error'};
            errorToast(`API ERROR: ${response.status}: ${payload['error']}`);
            throw new Error(`API error: ${payload['error']}`);
        }

        // Parse and return JSON response
        return await response.json();
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        errorToast(`API ERROR: ${endpoint}: ${error}`);
        // Return fallback data if provided
        if (fallbackData !== undefined) {
            return fallbackData as T;
        }

        // Otherwise rethrow the error
        throw error;
    }
}