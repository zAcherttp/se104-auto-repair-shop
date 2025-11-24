// Mock server actions to prevent Next.js server code from running in test environment

// Mock login/auth actions
export const Login = jest.fn();
export const SignOut = jest.fn();

// Mock vehicles actions
export const createReception = jest.fn();
export const updateRepairOrder = jest.fn();
export const getVehicleRegistrations = jest.fn();
export const removeVehicle = jest.fn();

// Mock inventory actions
export const addSparePart = jest.fn();

// Mock other common server actions that might be imported
export const checkAdminRole = jest.fn().mockResolvedValue(true);
export const getUserProfile = jest.fn();
export const updateGarageSettings = jest.fn();
export const addEmployee = jest.fn();
export const deleteEmployee = jest.fn();
export const addPartType = jest.fn();
export const addLaborType = jest.fn();
export const addCarBrand = jest.fn();

// Export default for any default imports
export default {
  Login,
  SignOut,
  createReception,
  updateRepairOrder,
  getVehicleRegistrations,
  removeVehicle,
  addSparePart,
  checkAdminRole,
  getUserProfile,
  updateGarageSettings,
  addEmployee,
  deleteEmployee,
  addPartType,
  addLaborType,
  addCarBrand,
};
