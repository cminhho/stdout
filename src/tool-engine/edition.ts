import { Edition } from "./types";

const EDITION_KEY = "stdout-edition";

export const getEdition = (): Edition => {
  try {
    const stored = localStorage.getItem(EDITION_KEY);
    if (stored === "mca" || stored === "public") return stored;
  } catch {}
  return "public";
};

export const setEdition = (edition: Edition) => {
  localStorage.setItem(EDITION_KEY, edition);
};
