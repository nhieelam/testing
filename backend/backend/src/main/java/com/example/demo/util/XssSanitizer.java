package com.example.demo.util;

/**
 * Utility class for XSS (Cross-Site Scripting) protection.
 * Provides methods to detect and sanitize potentially dangerous HTML/script content.
 * 
 * Note: The primary defense against XSS is output escaping on the frontend.
 * This utility provides an additional layer of defense by rejecting clearly dangerous inputs.
 */
public class XssSanitizer {

    /**
     * Checks if a string contains potentially dangerous HTML/script patterns.
     * 
     * @param input The string to check
     * @return true if dangerous patterns are detected, false otherwise
     */
    public static boolean containsDangerousContent(String input) {
        if (input == null || input.isEmpty()) {
            return false;
        }

        String lowerInput = input.toLowerCase();
        
        // Check for common XSS patterns
        return lowerInput.contains("<script") ||
               lowerInput.contains("</script>") ||
               lowerInput.contains("javascript:") ||
               lowerInput.contains("onerror=") ||
               lowerInput.contains("onload=") ||
               lowerInput.contains("onclick=") ||
               lowerInput.contains("<iframe") ||
               lowerInput.contains("<img") && lowerInput.contains("onerror");
    }

    /**
     * Validates product name for XSS protection.
     * Rejects names containing dangerous HTML/script patterns.
     * 
     * @param name The product name to validate
     * @return Validation result with error message if dangerous content is found
     */
    public static ValidationResult validateProductName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return new ValidationResult(false, "Product name cannot be empty");
        }

        if (containsDangerousContent(name)) {
            return new ValidationResult(false, 
                "Product name contains potentially dangerous content. HTML and script tags are not allowed.");
        }

        return new ValidationResult(true, null);
    }

    /**
     * Simple validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        public ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}

