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
];
