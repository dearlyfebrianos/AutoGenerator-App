const DRAFT_KEY = "autogen_cv_drafts";
const LEGACY_DRAFT_KEY = "autogen_cv_draft";
const ACHIEVEMENT_KEY = "autogen_achievements";
const APP_VERSION = "1.3.0";

const DEFAULT_STORE = {
  version: APP_VERSION,
  drafts: [],
};

const createDraftId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const sanitizeDraftName = (name) => {
  if (typeof name !== "string") return "Draft Tanpa Nama";

  const trimmed = name.trim();
  return trimmed || "Draft Tanpa Nama";
};

const sortByRecent = (drafts) =>
  [...drafts].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

const writeStore = (store) => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(store));
};

const readStore = () => {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return { ...DEFAULT_STORE };

    const parsed = JSON.parse(saved);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray(parsed.drafts)
    ) {
      return {
        version: APP_VERSION,
        drafts: parsed.drafts,
      };
    }
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
  }

  return { ...DEFAULT_STORE };
};

const migrateLegacyDraft = (store) => {
  try {
    const legacySaved = localStorage.getItem(LEGACY_DRAFT_KEY);
    if (!legacySaved || store.drafts.length > 0) return store;

    const parsedLegacy = JSON.parse(legacySaved);
    const legacyData = parsedLegacy?.data || parsedLegacy;
    if (!legacyData || typeof legacyData !== "object") return store;

    const legacyTimestamp = parsedLegacy?.timestamp || Date.now();
    const migratedDraft = {
      id: createDraftId(),
      name: "Draft Lama",
      createdAt: legacyTimestamp,
      updatedAt: legacyTimestamp,
      data: legacyData,
    };

    const migratedStore = {
      version: APP_VERSION,
      drafts: [migratedDraft],
    };

    writeStore(migratedStore);
    localStorage.removeItem(LEGACY_DRAFT_KEY);
    return migratedStore;
  } catch (e) {
    console.warn("Gagal migrasi draft lama:", e);
    return store;
  }
};

const getStore = () => {
  const store = readStore();
  return migrateLegacyDraft(store);
};

export const listDrafts = () => {
  try {
    const store = getStore();
    return sortByRecent(store.drafts).map((draft) => ({
      id: draft.id,
      name: draft.name,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    }));
  } catch (e) {
    console.warn("Gagal mengambil daftar draft:", e);
    return [];
  }
};

export const saveDraft = (data, options = {}) => {
  try {
    const store = getStore();
    const now = Date.now();
    const selectedId = options?.id;
    const name = sanitizeDraftName(options?.name);
    const draftIndex = selectedId
      ? store.drafts.findIndex((draft) => draft.id === selectedId)
      : -1;

    let savedDraft;

    if (draftIndex >= 0) {
      savedDraft = {
        ...store.drafts[draftIndex],
        name,
        data,
        updatedAt: now,
      };
      store.drafts[draftIndex] = savedDraft;
    } else {
      savedDraft = {
        id: createDraftId(),
        name,
        data,
        createdAt: now,
        updatedAt: now,
      };
      store.drafts.push(savedDraft);
    }

    writeStore({
      version: APP_VERSION,
      drafts: store.drafts,
    });

    return {
      id: savedDraft.id,
      name: savedDraft.name,
      createdAt: savedDraft.createdAt,
      updatedAt: savedDraft.updatedAt,
    };
  } catch (e) {
    console.warn("Gagal menyimpan draft:", e);
    return null;
  }
};

export const loadDraft = (draftId) => {
  try {
    const store = getStore();
    if (store.drafts.length === 0) return null;

    const draft = draftId
      ? store.drafts.find((item) => item.id === draftId)
      : sortByRecent(store.drafts)[0];

    return draft?.data || null;
  } catch (e) {
    console.warn("Gagal memuat draft:", e);
    return null;
  }
};

export const clearDraft = (draftId) => {
  try {
    if (!draftId) {
      localStorage.removeItem(DRAFT_KEY);
      return;
    }

    const store = getStore();
    const filteredDrafts = store.drafts.filter((draft) => draft.id !== draftId);

    writeStore({
      version: APP_VERSION,
      drafts: filteredDrafts,
    });
  } catch (e) {
    console.warn("Gagal menghapus draft:", e);
  }
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
  } catch {
    return false;
  }
};
