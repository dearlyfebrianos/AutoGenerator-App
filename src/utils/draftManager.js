const DRAFT_KEY = "autogen_cv_draft";
const ACHIEVEMENT_KEY = "autogen_achievements";

export const saveDraft = (data) => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Gagal menyimpan draft:", e);
  }
};

export const loadDraft = () => {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
    return null;
  }
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