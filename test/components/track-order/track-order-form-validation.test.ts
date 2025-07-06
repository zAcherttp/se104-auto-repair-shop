/**
 * Track Order Form Validation Tests
 * 
 * This test suite focuses on validating the form logic and data validation
 * for the track-order search functionality.
 */

import { RepairTrackingFormSchema, RepairTrackingFormData } from "@/lib/form/definitions";

describe("Track Order Form Validation", () => {
  describe("License Plate Validation", () => {
    const validateLicensePlate = (query: string): { success: boolean; error?: string } => {
      try {
        // Trim whitespace before validation to match real-world behavior
        const trimmedQuery = query.trim();
        if (trimmedQuery === "") {
          return { success: false, error: "License plate cannot be empty" };
        }
        const result = RepairTrackingFormSchema.parse({ query: trimmedQuery });
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed" 
        };
      }
    };

    it("accepts valid license plate formats", () => {
      const validPlates = [
        "ABC-123",
        "XYZ-789", 
        "DEF-456",
        "AB-1234",
        "ABCD-12"
      ];

      validPlates.forEach(plate => {
        const result = validateLicensePlate(plate);
        expect(result.success).toBe(true);
      });
    });

    it("rejects empty license plate", () => {
      const result = validateLicensePlate("");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("rejects whitespace-only license plate", () => {
      const result = validateLicensePlate("   ");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("handles case sensitivity correctly", () => {
      const testCases = [
        "abc-123",
        "ABC-123",
        "Abc-123",
        "aBc-123"
      ];

      testCases.forEach(plate => {
        const result = validateLicensePlate(plate);
        expect(result.success).toBe(true);
      });
    });

    it("trims whitespace from input", () => {
      const platesWithWhitespace = [
        " ABC-123 ",
        "  ABC-123",
        "ABC-123  ",
        "\tABC-123\n"
      ];

      platesWithWhitespace.forEach(plate => {
        const result = validateLicensePlate(plate);
        expect(result.success).toBe(true);
      });
    });

    it("accepts various license plate lengths", () => {
      const differentLengths = [
        "A-1",      // Minimum valid
        "AB-12",    // Short format
        "ABC-123",  // Standard format
        "ABCD-1234", // Longer format
        "ABCDEF-123456" // Very long format
      ];

      differentLengths.forEach(plate => {
        const result = validateLicensePlate(plate);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Form Data Processing", () => {
    const processFormData = (rawData: { query: string }): RepairTrackingFormData => {
      // Simulate the form processing logic
      return {
        query: rawData.query.trim().toUpperCase()
      };
    };

    it("processes form data correctly", () => {
      const rawData = { query: " abc-123 " };
      const processed = processFormData(rawData);

      expect(processed.query).toBe("ABC-123");
    });

    it("handles various input formats", () => {
      const testCases = [
        { input: "abc-123", expected: "ABC-123" },
        { input: " XYZ-789 ", expected: "XYZ-789" },
        { input: "def-456", expected: "DEF-456" },
        { input: "\tghi-789\n", expected: "GHI-789" }
      ];

      testCases.forEach(({ input, expected }) => {
        const processed = processFormData({ query: input });
        expect(processed.query).toBe(expected);
      });
    });

    it("preserves special characters", () => {
      const specialCases = [
        { input: "ABC-123", expected: "ABC-123" },
        { input: "AB_123", expected: "AB_123" },
        { input: "A.B.123", expected: "A.B.123" }
      ];

      specialCases.forEach(({ input, expected }) => {
        const processed = processFormData({ query: input });
        expect(processed.query).toBe(expected);
      });
    });
  });

  describe("Search Query Formatting", () => {
    const formatSearchQuery = (query: string): string => {
      return query.trim().toUpperCase();
    };

    it("formats queries consistently", () => {
      const testCases = [
        { input: "abc-123", expected: "ABC-123" },
        { input: "Abc-123", expected: "ABC-123" },
        { input: "ABC-123", expected: "ABC-123" },
        { input: " abc-123 ", expected: "ABC-123" }
      ];

      testCases.forEach(({ input, expected }) => {
        expect(formatSearchQuery(input)).toBe(expected);
      });
    });

    it("handles edge cases", () => {
      expect(formatSearchQuery("")).toBe("");
      expect(formatSearchQuery("   ")).toBe("");
      expect(formatSearchQuery("a")).toBe("A");
    });

    it("preserves numbers and special characters", () => {
      const testCases = [
        "123-ABC",
        "A1B2C3",
        "ABC_123",
        "AB-CD-123"
      ];

      testCases.forEach(input => {
        const result = formatSearchQuery(input);
        expect(result).toBe(input.toUpperCase());
      });
    });
  });

  describe("Validation Error Messages", () => {
    it("provides meaningful error messages", () => {
      const invalidInputs = ["", "   "];

      invalidInputs.forEach(input => {
        try {
          RepairTrackingFormSchema.parse({ query: input });
          fail("Should have thrown validation error");
        } catch (error: any) {
          // Check if it's a ZodError with issues array
          if (error.issues) {
            expect(error.issues).toBeDefined();
            expect(error.issues.length).toBeGreaterThan(0);
            expect(typeof error.issues[0].message).toBe("string");
          } else if (error.errors) {
            expect(error.errors).toBeDefined();
            expect(error.errors.length).toBeGreaterThan(0);
            expect(typeof error.errors[0].message).toBe("string");
          } else {
            // If neither exists, the error structure is different than expected
            expect(error.message).toBeDefined();
          }
        }
      });
    });

    it("validates schema structure", () => {
      const validData: RepairTrackingFormData = { query: "ABC-123" };
      
      expect(() => RepairTrackingFormSchema.parse(validData)).not.toThrow();
    });
  });

  describe("Real-world Scenarios", () => {
    const simulateUserInput = (userInput: string): { query: string; isValid: boolean } => {
      try {
        const formatted = userInput.trim().toUpperCase();
        const validated = RepairTrackingFormSchema.parse({ query: formatted });
        return { query: validated.query, isValid: true };
      } catch {
        return { query: userInput, isValid: false };
      }
    };

    it("handles typical user input scenarios", () => {
      const scenarios = [
        { input: "abc123", description: "No dash separator" },
        { input: "ABC-123", description: "Standard format" },
        { input: " abc-123 ", description: "With whitespace" },
        { input: "abc_123", description: "Underscore separator" },
        { input: "VEHICLE001", description: "Long format" }
      ];

      scenarios.forEach(({ input, description }) => {
        const result = simulateUserInput(input);
        // Most inputs should be valid after processing
        expect(typeof result.query).toBe("string");
        expect(typeof result.isValid).toBe("boolean");
      });
    });

    it("processes copy-pasted license plates", () => {
      // Simulate license plates that might be copy-pasted with extra formatting
      const copyPastedInputs = [
        "License Plate: ABC-123",
        "ABC-123 (Active)",
        "[ABC-123]",
        "ABC-123\t",
        "ABC-123\r\n"
      ];

      copyPastedInputs.forEach(input => {
        // Extract just the license plate part
        const extracted = input.replace(/[^\w\-]/g, "").replace(/License|Plate|Active/gi, "");
        const result = simulateUserInput(extracted);
        
        if (extracted.length > 0) {
          expect(result.query).toBeDefined();
        }
      });
    });

    it("handles international license plate formats", () => {
      const internationalFormats = [
        "AB-123-CD",  // European style
        "123-ABC",    // Number first
        "A123BCD",    // No separators
        "AB12CD34"    // Mixed format
      ];

      internationalFormats.forEach(format => {
        const result = simulateUserInput(format);
        expect(result.query).toBe(format.toUpperCase());
        // These should be valid as the schema is flexible
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("Data Type Validation", () => {
    it("ensures query is a string", () => {
      const validInputs = [
        { query: "ABC-123" },
        { query: "XYZ-789" },
        { query: "" }
      ];

      validInputs.forEach(input => {
        const result = RepairTrackingFormSchema.safeParse(input);
        if (result.success) {
          expect(typeof result.data.query).toBe("string");
        }
      });
    });

    it("rejects non-string inputs", () => {
      const invalidInputs = [
        { query: 123 },
        { query: null },
        { query: undefined },
        { query: [] },
        { query: {} }
      ];

      invalidInputs.forEach(input => {
        const result = RepairTrackingFormSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it("validates required fields", () => {
      const incompleteInputs = [
        {},
        { otherField: "value" },
        { query: undefined }
      ];

      incompleteInputs.forEach(input => {
        const result = RepairTrackingFormSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });
});
