import { Tabs } from "../ui/Tabs";

const identityTabs = [
  { label: "Student", value: "student" },
  { label: "University Staff", value: "staff" },
  { label: "Field Staff", value: "field" },
];

export function LoginIdentityTabs({ value, onChange }) {
  return <Tabs items={identityTabs} value={value} onChange={onChange} />;
}
