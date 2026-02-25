import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import seedData from '../data/seed.json'
import { v4 as uuidv4 } from 'uuid'

const useCareerStore = create(
    persist(
        (set, get) => ({
            // ── Career Data ──────────────────────────────────────────────
            career: seedData,

            // ── Designer Settings ────────────────────────────────────────
            activeTemplate: 'executive-minimal',
            designMode: 'executive-minimal',  // board-minimal | executive-minimal | global-executive | modern-infrastructure | corporate-branded
            accentColor: '#C9A84C',
            fontPair: 'inter',
            marginSize: 'normal',   // 'tight' | 'normal' | 'spacious'
            lineSpacing: 'normal',  // 'compact' | 'normal' | 'relaxed'

            // ── JD Analyzer ──────────────────────────────────────────────
            jdText: '',
            jdAnalysis: null,

            // ── Version Control ──────────────────────────────────────────
            versions: [],           // max 5 named version slots
            activeVersionId: null,  // null = working draft

            // ── JD Suggestions ───────────────────────────────────────────
            pendingChanges: [],      // [{id, type, description, payload}]

            // ── App State ────────────────────────────────────────────────
            activeModule: 'career',

            // ══════════════════════════════════════════════════════════════
            // PROFILE ACTIONS
            // ══════════════════════════════════════════════════════════════
            updateProfile: (fields) =>
                set((s) => ({ career: { ...s.career, profile: { ...s.career.profile, ...fields } } })),

            updateSummary: (summary) =>
                set((s) => ({ career: { ...s.career, summary } })),

            updatePositioning: (positioning) =>
                set((s) => ({ career: { ...s.career, positioning } })),

            updateKeyStats: (fields) =>
                set((s) => ({ career: { ...s.career, keyStats: { ...s.career.keyStats, ...fields } } })),

            // ══════════════════════════════════════════════════════════════
            // EXPERIENCE ACTIONS
            // ══════════════════════════════════════════════════════════════
            addExperience: () =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: [
                            {
                                id: uuidv4(),
                                company: '',
                                role: '',
                                period: '',
                                location: '',
                                visible: true,
                                achievements: [],
                            },
                            ...s.career.experiences,
                        ],
                    },
                })),

            updateExperience: (id, fields) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === id ? { ...exp, ...fields } : exp
                        ),
                    },
                })),

            deleteExperience: (id) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.filter((exp) => exp.id !== id),
                    },
                })),

            reorderExperiences: (newOrder) =>
                set((s) => ({ career: { ...s.career, experiences: newOrder } })),

            // ══════════════════════════════════════════════════════════════
            // ACHIEVEMENT ACTIONS
            // ══════════════════════════════════════════════════════════════
            addAchievement: (expId) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId
                                ? {
                                    ...exp,
                                    achievements: [
                                        ...exp.achievements,
                                        { id: uuidv4(), text: '', tags: [], metrics: '' },
                                    ],
                                }
                                : exp
                        ),
                    },
                })),

            updateAchievement: (expId, achId, fields) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId
                                ? {
                                    ...exp,
                                    achievements: exp.achievements.map((ach) =>
                                        ach.id === achId ? { ...ach, ...fields } : ach
                                    ),
                                }
                                : exp
                        ),
                    },
                })),

            deleteAchievement: (expId, achId) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId
                                ? { ...exp, achievements: exp.achievements.filter((a) => a.id !== achId) }
                                : exp
                        ),
                    },
                })),

            reorderAchievements: (expId, newOrder) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId ? { ...exp, achievements: newOrder } : exp
                        ),
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // EDUCATION ACTIONS
            // ══════════════════════════════════════════════════════════════
            addEducation: () =>
                set((s) => ({
                    career: {
                        ...s.career,
                        education: [
                            ...s.career.education,
                            { id: uuidv4(), institution: '', degree: '', field: '', year: '', visible: true },
                        ],
                    },
                })),

            updateEducation: (id, fields) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        education: s.career.education.map((e) => (e.id === id ? { ...e, ...fields } : e)),
                    },
                })),

            deleteEducation: (id) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        education: s.career.education.filter((e) => e.id !== id),
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // CERTIFICATION ACTIONS
            // ══════════════════════════════════════════════════════════════
            addCertification: () =>
                set((s) => ({
                    career: {
                        ...s.career,
                        certifications: [
                            ...s.career.certifications,
                            { id: uuidv4(), name: '', issuer: '', year: '', valid: true, visible: true },
                        ],
                    },
                })),

            updateCertification: (id, fields) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        certifications: s.career.certifications.map((c) =>
                            c.id === id ? { ...c, ...fields } : c
                        ),
                    },
                })),

            deleteCertification: (id) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        certifications: s.career.certifications.filter((c) => c.id !== id),
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // SKILLS ACTIONS
            // ══════════════════════════════════════════════════════════════
            updateSkills: (category, skills) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        skills: { ...s.career.skills, [category]: skills },
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // SECTION ORDER & VISIBILITY
            // ══════════════════════════════════════════════════════════════
            reorderSections: (newOrder) =>
                set((s) => ({ career: { ...s.career, sectionOrder: newOrder } })),

            toggleSectionVisibility: (section) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        sectionVisibility: {
                            ...s.career.sectionVisibility,
                            [section]: !s.career.sectionVisibility[section],
                        },
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // DESIGNER SETTINGS
            // ══════════════════════════════════════════════════════════════
            setTemplate: (t) => set({ activeTemplate: t }),
            setDesignMode: (mode) => set({ designMode: mode }),
            setAccentColor: (c) => set({ accentColor: c }),
            setFontPair: (f) => set({ fontPair: f }),
            setMarginSize: (m) => set({ marginSize: m }),
            setLineSpacing: (s) => set({ lineSpacing: s }),
            updateCareer: (fields) => set((s) => ({ career: { ...s.career, ...fields } })),
            setActiveModule: (m) => set({ activeModule: m }),

            // ══════════════════════════════════════════════════════════════
            // JD ANALYZER
            // ══════════════════════════════════════════════════════════════
            setJdText: (text) => set({ jdText: text }),
            setJdAnalysis: (analysis) => set({ jdAnalysis: analysis }),

            // ══════════════════════════════════════════════════════════════
            // JD SUGGESTIONS (preview-based, user-confirmed)
            // ══════════════════════════════════════════════════════════════
            addPendingChange: (change) =>
                set((s) => ({ pendingChanges: [...s.pendingChanges, { id: uuidv4(), ...change }] })),

            acceptPendingChange: (id) => {
                const change = get().pendingChanges.find((c) => c.id === id)
                if (!change) return
                if (change.type === 'reorderSkillCategory') {
                    const { category, newOrder } = change.payload
                    set((s) => ({ career: { ...s.career, skills: { ...s.career.skills, [category]: newOrder } } }))
                }
                if (change.type === 'reorderAchievements') {
                    const { expId, newOrder } = change.payload
                    set((s) => ({
                        career: {
                            ...s.career,
                            experiences: s.career.experiences.map((e) =>
                                e.id === expId ? { ...e, achievements: newOrder } : e
                            ),
                        },
                    }))
                }
                if (change.type === 'updateSummary') {
                    set({ career: { ...get().career, summary: change.payload.summary } })
                }
                set((s) => ({ pendingChanges: s.pendingChanges.filter((c) => c.id !== id) }))
            },

            rejectPendingChange: (id) =>
                set((s) => ({ pendingChanges: s.pendingChanges.filter((c) => c.id !== id) })),

            clearPendingChanges: () => set({ pendingChanges: [] }),

            // ══════════════════════════════════════════════════════════════
            // VERSION CONTROL
            // ══════════════════════════════════════════════════════════════
            createVersion: (name) => {
                const { versions, career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing, jdText, jdAnalysis } = get()
                if (versions.length >= 5) return false
                const v = {
                    id: uuidv4(),
                    name: name || `Version ${versions.length + 1}`,
                    createdAt: new Date().toISOString(),
                    template: activeTemplate,
                    accentColor,
                    fontPair,
                    marginSize,
                    lineSpacing,
                    sectionOrder: career.sectionOrder ? [...career.sectionOrder] : null,
                    sectionVisibility: career.sectionVisibility ? { ...career.sectionVisibility } : null,
                    positioning: career.positioning,
                    jdText,
                    jdAnalysis,
                    lockedAchievements: [],
                    hiddenAchievements: [],
                }
                set((s) => ({ versions: [...s.versions, v], activeVersionId: v.id }))
                return v.id
            },

            updateVersion: (id, fields) =>
                set((s) => ({ versions: s.versions.map((v) => v.id === id ? { ...v, ...fields } : v) })),

            deleteVersion: (id) =>
                set((s) => ({
                    versions: s.versions.filter((v) => v.id !== id),
                    activeVersionId: s.activeVersionId === id ? null : s.activeVersionId,
                })),

            duplicateVersion: (id) => {
                const { versions } = get()
                if (versions.length >= 5) return false
                const src = versions.find((v) => v.id === id)
                if (!src) return false
                const copy = { ...src, id: uuidv4(), name: `${src.name} (copy)`, createdAt: new Date().toISOString() }
                set((s) => ({ versions: [...s.versions, copy], activeVersionId: copy.id }))
                return copy.id
            },

            switchVersion: (id) => {
                const v = get().versions.find((ver) => ver.id === id)
                if (!v) return
                set({
                    activeVersionId: id,
                    activeTemplate: v.template,
                    accentColor: v.accentColor,
                    fontPair: v.fontPair,
                    marginSize: v.marginSize,
                    lineSpacing: v.lineSpacing,
                    jdText: v.jdText || '',
                    jdAnalysis: v.jdAnalysis || null,
                })
                // Restore section order/visibility if saved
                if (v.sectionOrder || v.sectionVisibility || v.positioning) {
                    set((s) => ({
                        career: {
                            ...s.career,
                            ...(v.sectionOrder ? { sectionOrder: v.sectionOrder } : {}),
                            ...(v.sectionVisibility ? { sectionVisibility: v.sectionVisibility } : {}),
                            ...(v.positioning ? { positioning: v.positioning } : {}),
                        },
                    }))
                }
            },

            saveCurrentToVersion: (id) => {
                const { career, activeTemplate, accentColor, fontPair, marginSize, lineSpacing, jdText, jdAnalysis } = get()
                set((s) => ({
                    versions: s.versions.map((v) => v.id === id ? {
                        ...v,
                        template: activeTemplate,
                        accentColor,
                        fontPair,
                        marginSize,
                        lineSpacing,
                        sectionOrder: career.sectionOrder ? [...career.sectionOrder] : null,
                        sectionVisibility: career.sectionVisibility ? { ...career.sectionVisibility } : null,
                        positioning: career.positioning,
                        jdText,
                        jdAnalysis,
                    } : v),
                }))
            },

            toggleLockAchievement: (versionId, achId) =>
                set((s) => ({
                    versions: s.versions.map((v) => {
                        if (v.id !== versionId) return v
                        const locked = v.lockedAchievements.includes(achId)
                            ? v.lockedAchievements.filter((a) => a !== achId)
                            : [...v.lockedAchievements, achId]
                        return { ...v, lockedAchievements: locked }
                    }),
                })),

            toggleHideAchievement: (versionId, achId) =>
                set((s) => ({
                    versions: s.versions.map((v) => {
                        if (v.id !== versionId) return v
                        const hidden = v.hiddenAchievements.includes(achId)
                            ? v.hiddenAchievements.filter((a) => a !== achId)
                            : [...v.hiddenAchievements, achId]
                        return { ...v, hiddenAchievements: hidden }
                    }),
                })),

            clearActiveVersion: () => set({ activeVersionId: null }),

            // ══════════════════════════════════════════════════════════════
            // IMPORT / EXPORT
            // ══════════════════════════════════════════════════════════════
            exportData: () => {
                const data = get().career
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `careerwep_${new Date().toISOString().slice(0, 10)}.json`
                a.click()
                URL.revokeObjectURL(url)
            },

            importData: (jsonData) => {
                try {
                    const parsed = JSON.parse(jsonData)
                    set({ career: parsed })
                    return true
                } catch {
                    return false
                }
            },

            // Used by PDF import modal — sets career from parsed CV object
            importCareer: (data) => set({ career: data }),

            resetToSeed: () => set({ career: seedData }),

        }),
        {
            name: 'careerwep-storage',
            version: 4,
        }
    )
)

export default useCareerStore
