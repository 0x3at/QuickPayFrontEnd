import { errorToast, successToast } from "@/lib/utils";

// Use relative path in production, full URL in development
const API_BASE_URL = 'http://127.0.0.1:8000/quickpay/api/v2';

// Standard API response format
interface ApiResponse<T> {
  success: 0 | 1;
  data: T | null;
  error?: string;
}

// Type for request options
type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  showSuccessToast?: boolean;
  successMessage?: string;
}

/**
 * Generic fetch function for V2 API endpoints
 * Handles standardized response format and error toasting
 */
export async function apiV2Request<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    showSuccessToast = false,
    successMessage
  } = options;

  try {
    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      ...(body && { body: JSON.stringify(body) })
    };

    // Make the request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestOptions);
    
    // Parse the response
    const responseData: ApiResponse<T> = await response.json();
    
    // Check for success flag
    if (responseData.success === 1 && responseData.data) {
      // Show success toast if requested
      if (showSuccessToast) {
        successToast(successMessage || 'Operation completed successfully');
      }
      
      // Return just the data part
      return responseData.data;
    } else {
      // Handle API error (success: 0)
      const errorMessage = responseData.error || 'Unknown error occurred';
      errorToast(`API Error: ${errorMessage}`);
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Handle network or parsing errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API request failed for ${endpoint}:`, error);
    errorToast(`API Error: ${errorMessage}`);
    throw error;
  }
}
