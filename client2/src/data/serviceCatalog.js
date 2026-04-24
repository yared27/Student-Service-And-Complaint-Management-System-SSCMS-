import {
  FileText,
  IdCard,
  Home,
  GraduationCap,
  Award,
  BookOpen,
  Wifi,
  Wrench,
  Building2,
  Bus,
  ShieldCheck,
  Landmark,
} from "lucide-react";

export const serviceCatalog = [
  {
    code: "TRANSCRIPT_ORIGINAL",
    icon: FileText,
    title: "Original Transcript",
    office: "Registrar",
    defaultPriority: "MEDIUM",
    description: "Order an official transcript copy for academic or job applications.",
    template:
      "I am requesting an original transcript. Please include all completed semesters and cumulative GPA. I need this document for official use.",
  },
  {
    code: "ID_REPLACEMENT",
    icon: IdCard,
    title: "ID Replacement",
    office: "ICT Center",
    defaultPriority: "MEDIUM",
    description: "Replace a lost, damaged, or expired student ID card.",
    template:
      "I need to replace my student ID due to loss/damage. Please advise the next steps and required verification.",
  },
  {
    code: "DORM_CHANGE",
    icon: Home,
    title: "Dorm Change Request",
    office: "Proctor's Office",
    defaultPriority: "LOW",
    description: "Apply to transfer to a different dorm block or room.",
    template:
      "I am requesting a dorm change due to accommodation concerns. Please review my request and available options.",
  },
  {
    code: "CLEARANCE",
    icon: Award,
    title: "Semester Clearance",
    office: "Registrar",
    defaultPriority: "LOW",
    description: "Start semester-end or graduation clearance workflow.",
    template:
      "Please initiate my semester clearance process and share pending offices/requirements if any.",
  },
  {
    code: "GRAD_VERIFICATION",
    icon: GraduationCap,
    title: "Graduation Verification",
    office: "Registrar",
    defaultPriority: "MEDIUM",
    description: "Request official verification of expected or completed graduation status.",
    template:
      "I need official graduation verification for external submission. Kindly process and provide the required confirmation.",
  },
  {
    code: "LIBRARY_RENEWAL",
    icon: BookOpen,
    title: "Library Membership Renewal",
    office: "Library",
    defaultPriority: "LOW",
    description: "Renew or reactivate your library membership.",
    template:
      "Please renew my library membership and restore borrowing privileges for this semester.",
  },
  {
    code: "WIFI_ACCESS",
    icon: Wifi,
    title: "Campus Wi-Fi Access",
    office: "ICT Center",
    defaultPriority: "MEDIUM",
    description: "Request new or restored campus internet credentials.",
    template:
      "I am unable to access campus Wi-Fi. Please issue/reset my access credentials and confirm activation.",
  },
  {
    code: "LAB_MAINTENANCE",
    icon: Wrench,
    title: "Lab Equipment Maintenance",
    office: "Maintenance",
    defaultPriority: "HIGH",
    description: "Report broken laboratory devices or safety-related issues.",
    template:
      "Laboratory equipment is malfunctioning and needs maintenance. Please assign technical staff for urgent inspection.",
  },
  {
    code: "CLASSROOM_REPAIR",
    icon: Building2,
    title: "Classroom Facility Repair",
    office: "Maintenance",
    defaultPriority: "MEDIUM",
    description: "Report issues with classroom lights, seats, fans, or doors.",
    template:
      "Classroom facilities require repair. Please review and schedule maintenance at the earliest possible time.",
  },
  {
    code: "SHUTTLE_PASS",
    icon: Bus,
    title: "Campus Shuttle Pass",
    office: "Student Services",
    defaultPriority: "LOW",
    description: "Request or renew student shuttle transportation pass.",
    template:
      "I am requesting a campus shuttle pass for regular transportation between campus locations.",
  },
  {
    code: "SECURITY_ESCORT",
    icon: ShieldCheck,
    title: "Security Escort Assistance",
    office: "Campus Security",
    defaultPriority: "HIGH",
    description: "Request safety escort for late hours or incident-prone routes.",
    template:
      "I need security escort assistance for safe movement within campus during late hours.",
  },
  {
    code: "FINANCE_LETTER",
    icon: Landmark,
    title: "Tuition/Payment Confirmation Letter",
    office: "Finance Office",
    defaultPriority: "MEDIUM",
    description: "Request official proof of tuition payment or financial standing.",
    template:
      "Please provide an official tuition/payment confirmation letter for documentation purposes.",
  },
];
