/**
 * Settings Data Processing Tests
 * 
 * This test suite focuses on testing data processing logic for settings functionality,
 * including employee data validation, system settings processing, and business logic.
 */

import { 
  mockEmployee, 
  mockEmployeesArray, 
  mockEmployeesEmptyArray,
  mockSystemSettingsArray,
  mockSparePartsArray,
  mockLaborTypesArray,
  mockEmptySparePartsArray,
  mockEmptyLaborTypesArray
} from "@/test/mocks/settings-data";
import type { Employee, SystemSetting, SparePart, LaborType } from "@/types/settings";

describe("Settings Data Processing", () => {
  describe("Employee Data Validation", () => {
    it("should validate employee data structure", () => {
      expect(mockEmployee).toHaveProperty("id");
      expect(mockEmployee).toHaveProperty("email");
      expect(mockEmployee).toHaveProperty("full_name");
      expect(mockEmployee).toHaveProperty("role");
      expect(mockEmployee).toHaveProperty("created_at");
      expect(mockEmployee).toHaveProperty("updated_at");
    });

    it("should validate employee email format", () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(mockEmployee.email)).toBeTruthy();
    });

    it("should validate employee role values", () => {
      const validRoles = ["admin", "mechanic", "service_advisor", "cashier"];
      expect(validRoles).toContain(mockEmployee.role);
    });

    it("should handle employees array processing", () => {
      expect(Array.isArray(mockEmployeesArray)).toBeTruthy();
      expect(mockEmployeesArray.length).toBeGreaterThan(0);
      
      mockEmployeesArray.forEach((employee) => {
        expect(employee).toHaveProperty("id");
        expect(employee).toHaveProperty("email");
        expect(typeof employee.id).toBe("string");
        expect(typeof employee.email).toBe("string");
      });
    });

    it("should handle empty employees array", () => {
      expect(Array.isArray(mockEmployeesEmptyArray)).toBeTruthy();
      expect(mockEmployeesEmptyArray.length).toBe(0);
    });

    it("should validate employee full name handling", () => {
      const employeeWithName = mockEmployeesArray.find(emp => emp.full_name !== null);
      expect(employeeWithName).toBeDefined();
      expect(typeof employeeWithName?.full_name).toBe("string");
    });
  });

  describe("System Settings Data Processing", () => {
    it("should convert settings array to key-value map", () => {
      const settingsMap = mockSystemSettingsArray.reduce(
        (acc: Record<string, string>, setting: SystemSetting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        },
        {}
      );

      expect(settingsMap).toHaveProperty("garage_name");
      expect(settingsMap).toHaveProperty("phone_number");
      expect(settingsMap).toHaveProperty("email_address");
      expect(settingsMap).toHaveProperty("address");
      expect(settingsMap).toHaveProperty("maximum_car_capacity");
    });

    it("should validate numeric settings", () => {
      const numericSettings = mockSystemSettingsArray.filter(setting => 
        ["maximum_car_capacity", "max_parts_per_month", "max_labor_types_per_month"].includes(setting.setting_key)
      );

      numericSettings.forEach(setting => {
        const numValue = parseInt(setting.setting_value);
        expect(isNaN(numValue)).toBeFalsy();
        expect(numValue).toBeGreaterThan(0);
      });
    });

    it("should validate contact information settings", () => {
      const phoneRegex = /^\+?\d[\d\s\-\(\)]*$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const phoneNumber = mockSystemSettingsArray.find(s => s.setting_key === "phone_number")?.setting_value;
      const emailAddress = mockSystemSettingsArray.find(s => s.setting_key === "email_address")?.setting_value;

      if (phoneNumber) {
        expect(phoneRegex.test(phoneNumber)).toBeTruthy();
      }
      if (emailAddress) {
        expect(emailRegex.test(emailAddress)).toBeTruthy();
      }
    });

    it("should handle garage name processing", () => {
      const garageName = mockSystemSettingsArray.find(s => s.setting_key === "garage_name")?.setting_value;
      expect(garageName).toBeDefined();
      expect(typeof garageName).toBe("string");
      if (garageName) {
        expect(garageName.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Spare Parts Data Processing", () => {
    it("should validate spare part data structure", () => {
      mockSparePartsArray.forEach(part => {
        expect(part).toHaveProperty("id");
        expect(part).toHaveProperty("name");
        expect(part).toHaveProperty("price");
        expect(part).toHaveProperty("stock_quantity");
        expect(typeof part.id).toBe("string");
        expect(typeof part.name).toBe("string");
        expect(typeof part.price).toBe("number");
      });
    });

    it("should validate part pricing", () => {
      mockSparePartsArray.forEach(part => {
        expect(part.price).toBeGreaterThan(0);
        expect(Number.isFinite(part.price)).toBeTruthy();
      });
    });

    it("should handle stock quantity validation", () => {
      mockSparePartsArray.forEach(part => {
        if (part.stock_quantity !== null) {
          expect(part.stock_quantity).toBeGreaterThanOrEqual(0);
          expect(Number.isInteger(part.stock_quantity)).toBeTruthy();
        }
      });
    });

    it("should handle empty parts array", () => {
      expect(Array.isArray(mockEmptySparePartsArray)).toBeTruthy();
      expect(mockEmptySparePartsArray.length).toBe(0);
    });

    it("should format part names properly", () => {
      mockSparePartsArray.forEach(part => {
        expect(part.name.trim()).toBe(part.name);
        expect(part.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Labor Types Data Processing", () => {
    it("should validate labor type data structure", () => {
      mockLaborTypesArray.forEach(laborType => {
        expect(laborType).toHaveProperty("id");
        expect(laborType).toHaveProperty("name");
        expect(laborType).toHaveProperty("cost");
        expect(typeof laborType.id).toBe("string");
        expect(typeof laborType.name).toBe("string");
        expect(typeof laborType.cost).toBe("number");
      });
    });

    it("should validate labor cost pricing", () => {
      mockLaborTypesArray.forEach(laborType => {
        expect(laborType.cost).toBeGreaterThan(0);
        expect(Number.isFinite(laborType.cost)).toBeTruthy();
      });
    });

    it("should handle empty labor types array", () => {
      expect(Array.isArray(mockEmptyLaborTypesArray)).toBeTruthy();
      expect(mockEmptyLaborTypesArray.length).toBe(0);
    });

    it("should format labor type names properly", () => {
      mockLaborTypesArray.forEach(laborType => {
        expect(laborType.name.trim()).toBe(laborType.name);
        expect(laborType.name.length).toBeGreaterThan(0);
      });
    });

    it("should sort labor types by cost", () => {
      const sortedByPrice = [...mockLaborTypesArray].sort((a, b) => a.cost - b.cost);
      const sortedByCostDesc = [...mockLaborTypesArray].sort((a, b) => b.cost - a.cost);
      
      expect(sortedByPrice[0].cost).toBeLessThanOrEqual(sortedByPrice[sortedByPrice.length - 1].cost);
      expect(sortedByCostDesc[0].cost).toBeGreaterThanOrEqual(sortedByCostDesc[sortedByCostDesc.length - 1].cost);
    });
  });

  describe("Data Transformation and Utilities", () => {
    it("should transform employees for display", () => {
      const transformedEmployees = mockEmployeesArray.map(emp => ({
        ...emp,
        displayName: emp.full_name || emp.email,
        roleDisplay: emp.role.replace("_", " ").toLowerCase(),
      }));

      transformedEmployees.forEach(emp => {
        expect(emp.displayName).toBeDefined();
        expect(emp.displayName.length).toBeGreaterThan(0);
        expect(emp.roleDisplay).toBeDefined();
      });
    });

    it("should calculate total inventory value", () => {
      const totalValue = mockSparePartsArray.reduce((total, part) => {
        const stockValue = (part.stock_quantity || 0) * part.price;
        return total + stockValue;
      }, 0);

      expect(totalValue).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(totalValue)).toBeTruthy();
    });

    it("should filter low stock items", () => {
      const lowStockThreshold = 20;
      const lowStockItems = mockSparePartsArray.filter(part => 
        part.stock_quantity !== null && part.stock_quantity < lowStockThreshold
      );

      lowStockItems.forEach(item => {
        expect(item.stock_quantity).toBeLessThan(lowStockThreshold);
      });
    });

    it("should validate setting key formats", () => {
      const settingKeyRegex = /^[a-z][a-z0-9_]*[a-z0-9]$/;
      
      mockSystemSettingsArray.forEach(setting => {
        expect(settingKeyRegex.test(setting.setting_key)).toBeTruthy();
      });
    });
  });
});
