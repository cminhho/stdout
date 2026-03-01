/**
 * Common regex presets for Regex Tester (pattern + matching test string).
 */

export interface RegexPreset {
  id: string;
  label: string;
  pattern: string;
  testString: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "email",
    label: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    testString: "Contact: alice@example.com or bob+tag@test.co.uk\nInvalid: missing@ or @nodomain\nSupport: help@myapp.io",
  },
  {
    id: "phone",
    label: "Phone",
    pattern: "\\+?[\\d\\s.-]{10,}",
    testString: "+1 555-123-4567\n(02) 9876 5432\n555.123.4567\nCall 800-555-0199 for info",
  },
  {
    id: "url",
    label: "URL",
    pattern: "https?://[^\\s]+",
    testString: "Visit https://example.com and http://test.org/path?q=1\nNot a link: ftp://old\nDocs: https://docs.example.com/page",
  },
  {
    id: "date-iso",
    label: "Date (ISO)",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    testString: "Created: 2024-03-15, due 2025-01-01\nInvalid: 2024/03/15 or 15-03-2024\nRange: 2023-12-01 to 2024-06-30",
  },
  {
    id: "uuid",
    label: "UUID",
    pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}",
    testString: "id: 550e8400-e29b-41d4-a716-446655440000\nRef: a1b2c3d4-e5f6-7890-abcd-ef1234567890\nNot UUID: 550e8400-e29b-41d4-a716",
  },
];
