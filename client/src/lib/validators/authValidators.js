import { normalizeUpper as normalizeUpperUtil } from "../utils/normalize";

export const studentIdRegex = /^(NSR|SSR)\/\d{1,6}\/\d{2,4}$/i;
export const amuEmailRegex = /^[A-Za-z0-9._%+-]+@amu\.edu\.et$/i;
export const employeeIdRegex = /^[A-Z]{2,5}-\d{2,5}$/i;

export function normalizeUpper(value) {
  return normalizeUpperUtil(value);
}

export function validateStudentId(value) {
  return studentIdRegex.test(String(value || "").trim());
}

export function validateAmuEmail(value) {
  return amuEmailRegex.test(String(value || "").trim());
}

export function validateEmployeeId(value) {
  return employeeIdRegex.test(String(value || "").trim());
}

export function validatePassword(value) {
  return String(value || "").length >= 8;
}
