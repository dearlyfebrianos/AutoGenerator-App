const DRAFT_KEY = "autogen_cv_draft";
const ACHIEVEMENT_KEY = "autogen_achievements";
const APP_VERSION = "1.2.0";

export const saveDraft = (data) => {
  try {
    const draftData = {
      version: APP_VERSION,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  } catch (e) {
    console.warn("Gagal menyimpan draft:", e);
  }
};

export const loadDraft = () => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.version === APP_VERSION) {
        return parsed.data;
      }
      console.log(
        "Draft diabaikan karena versi berbeda:",
        parsed.version,
        "≠",
        APP_VERSION,
      );
    }
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
  }
  return null;
};

export const clearDraft = () => {
  localStorage.removeItem(DRAFT_KEY);
};

export const unlockAchievement = (achievement) => {
  try {
    const achievements = JSON.parse(
      localStorage.getItem(ACHIEVEMENT_KEY) || "[]",
    );
    if (!achievements.includes(achievement)) {
      achievements.push(achievement);
      localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify(achievements));
      return true;
    }
    return false;
  } catch (e) {
    console.warn("Gagal unlock achievement:", e);
    return false;
  }
};

export const hasAchievement = (achievement) => {
  try {
    const achievements = JSON.parse(
      localStorage.getItem(ACHIEVEMENT_KEY) || "[]",
    );
    return achievements.includes(achievement);
  } catch (e) {
    return false;
  }
};