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
            activePdfTemplate: 'ExecutiveMinimalPDF',
            designMode: 'executive-minimal',  // board-minimal | executive-minimal | global-executive | modern-infrastructure | corporate-branded
            accentColor: '#B08D57',
            fontPair: 'inter',
            marginSize: 'normal',   // 'tight' | 'normal' | 'spacious'
            lineSpacing: 'normal',  // 'compact' | 'normal' | 'relaxed'

            // ── JD Analyzer ──────────────────────────────────────────────
            jdText: '',
            jdAnalysis: null,

            // ── Version Control ──────────────────────────────────────────
            versions: [],           // max 5 named version slots
            activeVersionId: null,  // null = working draft

            // ── AI Intelligence ──────────────────────────────────────────
            aiConfig: {
                provider: 'openai', // or 'gemini'
                apiKey: '',
                tone: 'executive', // 'executive' | 'corporate'
            },

            // ── JD Suggestions ───────────────────────────────────────────
            pendingChanges: [],      // [{id, type, description, payload}]

            // ── Cover Letter ─────────────────────────────────────────────
            coverLetter: {
                targetCompany: '',
                targetRole: '',
                jdContext: '',
                generatedText: '',
            },

            // ── App State ────────────────────────────────────────────────
            activeModule: 'career',
            isAuthenticated: false,

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

            updateKeyAchievements: (achievements) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        keyAchievements: achievements,
                        strategicImpact: achievements // keep them synced
                    }
                })),

            updateStrategicImpact: (items) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        strategicImpact: items,
                        keyAchievements: items // keep them synced
                    }
                })),

            updateTechEnvironment: (text) =>
                set((s) => ({ career: { ...s.career, techEnvironment: text } })),

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

            addDraftedAchievement: (expId, text) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId
                                ? {
                                    ...exp,
                                    achievements: [
                                        ...exp.achievements,
                                        { id: uuidv4(), text, tags: [], metrics: '' },
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

            updateFlagshipBullet: (expId, text) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId ? { ...exp, flagshipBullet: text } : exp
                        ),
                    },
                })),

            addAchievementFromJD: (expId, text, tags = []) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        experiences: s.career.experiences.map((exp) =>
                            exp.id === expId
                                ? {
                                    ...exp,
                                    achievements: [
                                        ...exp.achievements,
                                        { id: uuidv4(), text, tags, metrics: '', fromJD: true },
                                    ],
                                }
                                : exp
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

            updateSkillLabel: (category, label) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        skillLabels: { ...s.career.skillLabels, [category]: label },
                    },
                })),

            updateSectionLabel: (id, label) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        sectionLabels: { ...s.career.sectionLabels, [id]: label },
                    },
                })),

            addSkillCategory: (label) =>
                set((s) => {
                    const id = label.toLowerCase().replace(/\s+/g, '')
                    return {
                        career: {
                            ...s.career,
                            skills: { ...s.career.skills, [id]: [] },
                            skillLabels: { ...s.career.skillLabels, [id]: label },
                        },
                    }
                }),

            deleteSkillCategory: (id) =>
                set((s) => {
                    const newSkills = { ...s.career.skills }
                    const newLabels = { ...s.career.skillLabels }
                    delete newSkills[id]
                    delete newLabels[id]
                    return {
                        career: { ...s.career, skills: newSkills, skillLabels: newLabels },
                    }
                }),

            updateSkillLabel: (id, label) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        skillLabels: { ...s.career.skillLabels, [id]: label },
                    },
                })),

            addSkillItem: (category, item) =>
                set((s) => {
                    const skills = { ...s.career.skills }
                    if (!skills[category]) skills[category] = []
                    skills[category] = [...skills[category], item]
                    return { career: { ...s.career, skills } }
                }),

            removeSkillItem: (category, index) =>
                set((s) => {
                    const skills = { ...s.career.skills }
                    if (skills[category]) {
                        skills[category] = skills[category].filter((_, i) => i !== index)
                    }
                    return { career: { ...s.career, skills } }
                }),

            addAchievement: () =>
                set((s) => {
                    const ka = [...(s.career.keyAchievements || []), "New Achievement"]
                    return { career: { ...s.career, keyAchievements: ka, strategicImpact: ka } }
                }),

            removeAchievement: (index) =>
                set((s) => {
                    const ka = (s.career.keyAchievements || []).filter((_, i) => i !== index)
                    return { career: { ...s.career, keyAchievements: ka, strategicImpact: ka } }
                }),

            updateAchievement: (index, text) =>
                set((s) => {
                    const ka = [...(s.career.keyAchievements || [])]
                    ka[index] = text
                    return { career: { ...s.career, keyAchievements: ka, strategicImpact: ka } }
                }),

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

            addCustomSection: (label) =>
                set((s) => {
                    const id = `custom_${Date.now()}`
                    return {
                        career: {
                            ...s.career,
                            sectionOrder: [...s.career.sectionOrder, id],
                            sectionVisibility: { ...s.career.sectionVisibility, [id]: true },
                            sectionLabels: { ...s.career.sectionLabels, [id]: label },
                        },
                    }
                }),

            deleteCustomSection: (id) =>
                set((s) => ({
                    career: {
                        ...s.career,
                        sectionOrder: s.career.sectionOrder.filter(sid => sid !== id),
                        sectionVisibility: { ...s.career.sectionVisibility, [id]: false },
                        sectionLabels: { ...s.career.sectionLabels, [id]: undefined },
                    },
                })),

            // ══════════════════════════════════════════════════════════════
            // DESIGNER SETTINGS
            // ══════════════════════════════════════════════════════════════
            setTemplate: (t) => set({ activeTemplate: t }),
            setPdfTemplate: (t) => set({ activePdfTemplate: t }),
            setDesignMode: (mode) => set({ designMode: mode }),
            setAccentColor: (c) => set({ accentColor: c }),
            setFontPair: (f) => set({ fontPair: f }),
            setMarginSize: (m) => set({ marginSize: m }),
            setLineSpacing: (s) => set({ lineSpacing: s }),
            updateCareer: (fields) => set((s) => ({ career: { ...s.career, ...fields } })),
            setActiveModule: (m) => set({ activeModule: m }),
            updateAiConfig: (config) => set((s) => ({ aiConfig: { ...s.aiConfig, ...config } })),
            setAuthenticated: (status) => set({ isAuthenticated: status }),

            // ══════════════════════════════════════════════════════════════
            // AI AUTO-TAILOR
            // ══════════════════════════════════════════════════════════════
            applyAutoTailoredData: (tailoredJson) => {
                set((s) => {
                    const newCareer = JSON.parse(JSON.stringify(s.career))

                    // 1. Overwrite Summary
                    if (tailoredJson.summary) {
                        newCareer.summary = tailoredJson.summary
                    }

                    // 2. Overwrite Achievements (Matched by ID)
                    if (tailoredJson.achievements && Array.isArray(tailoredJson.achievements)) {
                        const tailoredAchMap = new Map()
                        tailoredJson.achievements.forEach(ach => {
                            if (ach.id && ach.text) {
                                tailoredAchMap.set(ach.id, ach.text)
                            }
                        })

                        // Now iterate existing experiences and update matching bullets
                        newCareer.experiences.forEach(exp => {
                            if (exp.achievements) {
                                exp.achievements.forEach(ach => {
                                    if (tailoredAchMap.has(ach.id)) {
                                        ach.text = tailoredAchMap.get(ach.id)
                                    }
                                })
                            }
                        })
                    }

                    return { career: newCareer }
                })
            },

            // ══════════════════════════════════════════════════════════════
            // COVER LETTER
            // ══════════════════════════════════════════════════════════════
            updateCoverLetter: (fields) => set((s) => ({ coverLetter: { ...s.coverLetter, ...fields } })),

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
                if (change.type === 'addAchievementFromJD') {
                    const { expId, text, tags } = change.payload
                    const { career } = get()
                    set({
                        career: {
                            ...career,
                            experiences: career.experiences.map((exp) =>
                                exp.id === expId
                                    ? {
                                        ...exp,
                                        achievements: [
                                            ...exp.achievements,
                                            { id: uuidv4(), text, tags: tags || [], metrics: '', fromJD: true },
                                        ],
                                    }
                                    : exp
                            ),
                        },
                    })
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
                const { versions, career, activeTemplate, activePdfTemplate, accentColor, fontPair, marginSize, lineSpacing, jdText, jdAnalysis } = get()
                if (versions.length >= 5) return false
                const v = {
                    id: uuidv4(),
                    name: name || `Version ${versions.length + 1}`,
                    createdAt: new Date().toISOString(),
                    template: activeTemplate,
                    pdfTemplate: activePdfTemplate,
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
                    careerSnapshot: JSON.parse(JSON.stringify(career)) // Deep copy of core content
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
                    activePdfTemplate: v.pdfTemplate || 'ExecutiveMinimalPDF',
                    accentColor: v.accentColor,
                    fontPair: v.fontPair,
                    marginSize: v.marginSize,
                    lineSpacing: v.lineSpacing,
                    jdText: v.jdText || '',
                    jdAnalysis: v.jdAnalysis || null,
                })
                // Restore career content if snapshot exists
                if (v.careerSnapshot) {
                    set({ career: JSON.parse(JSON.stringify(v.careerSnapshot)) })
                } else {
                    // Fallback for older versions: Restore section order/visibility if saved
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
                }
            },

            saveCurrentToVersion: (id) => {
                const { career, activeTemplate, activePdfTemplate, accentColor, fontPair, marginSize, lineSpacing, jdText, jdAnalysis } = get()
                set((s) => ({
                    versions: s.versions.map((v) => v.id === id ? {
                        ...v,
                        template: activeTemplate,
                        pdfTemplate: activePdfTemplate,
                        accentColor,
                        fontPair,
                        marginSize,
                        lineSpacing,
                        sectionOrder: career.sectionOrder ? [...career.sectionOrder] : null,
                        sectionVisibility: career.sectionVisibility ? { ...career.sectionVisibility } : null,
                        positioning: career.positioning,
                        jdText,
                        jdAnalysis,
                        careerSnapshot: JSON.parse(JSON.stringify(career)) // Update deep copy
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
                a.download = `frieze-wandabwa-cv_${new Date().toISOString().slice(0, 10)}.json`
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
            name: 'frieze-wandabwa-resume',
            version: 16,
            migrate: (persistedState, version) => {
                let migratedCareer = { ...persistedState.career }

                if (version < 8) {
                    if (migratedCareer.keyAchievements) {
                        migratedCareer.strategicImpact = [...migratedCareer.keyAchievements]
                    } else if (migratedCareer.strategicImpact) {
                        migratedCareer.keyAchievements = [...migratedCareer.strategicImpact]
                    }
                    migratedCareer.profile = { ...migratedCareer.profile, ...seedData.profile }
                    migratedCareer.certifications = seedData.certifications
                    migratedCareer.education = seedData.education
                    if (!migratedCareer.skills) migratedCareer.skills = {}
                    Object.keys(seedData.skills).forEach(k => {
                        if (!migratedCareer.skills[k] || migratedCareer.skills[k].length === 0) {
                            migratedCareer.skills[k] = seedData.skills[k]
                        }
                    })
                }

                if (version < 9) {
                    if (migratedCareer.experiences && seedData.experiences) {
                        migratedCareer.experiences = migratedCareer.experiences.map((exp, index) => {
                            const seedExp = seedData.experiences.find(s => s.company === exp.company) || seedData.experiences[index]
                            if (seedExp) {
                                return { ...exp, period: seedExp.period, location: seedExp.location, technologies: seedExp.technologies }
                            }
                            return exp
                        })
                    }
                }

                if (version < 10) {
                    // Add flagshipBullet to all existing experiences, keyStats and keyMetrics
                    if (migratedCareer.experiences) {
                        migratedCareer.experiences = migratedCareer.experiences.map(exp => ({
                            ...exp,
                            flagshipBullet: exp.flagshipBullet || '',
                        }))
                    }
                    if (!migratedCareer.keyStats) migratedCareer.keyStats = seedData.keyStats
                    if (!migratedCareer.keyMetrics) migratedCareer.keyMetrics = seedData.keyMetrics
                    // Clean LinkedIn URL to short ATS-friendly format
                    if (migratedCareer.profile?.linkedin?.startsWith('https://')) {
                        migratedCareer.profile.linkedin = migratedCareer.profile.linkedin
                            .replace('https://www.', '').replace('https://', '').replace(/\/$/, '')
                    }
                    // Set correct website and add github if missing
                    if (!migratedCareer.profile) migratedCareer.profile = {}
                    migratedCareer.profile.website = 'www.friezewandabwa.com'
                    if (!migratedCareer.profile.github) {
                        migratedCareer.profile.github = 'github.com/FRIEZEWANDABWA'
                    }
                }

                if (version < 11) {
                    // Visual redesign: clear hard metrics so title pillars show instead
                    // keyMetrics = [] → expertise pillars extracted from profile.title drive the header row
                    migratedCareer.keyMetrics = []
                    migratedCareer.keyStats = {}
                    // Update to Strategic Gold (muted) if still on the old bright gold
                    if (persistedState.accentColor === '#C9A84C') {
                        persistedState = { ...persistedState, accentColor: '#B08D57' }
                    }
                }

                if (version < 12) {
                    // Rename section label: Technology Environment → Technical Skills
                    const oldLabel = migratedCareer.sectionLabels?.techEnvironment
                    if (!oldLabel || oldLabel.toLowerCase().includes('technology environment')) {
                        migratedCareer.sectionLabels = {
                            ...migratedCareer.sectionLabels,
                            techEnvironment: 'Technical Skills',
                        }
                    }
                }

                if (version < 13) {
                    // ─ Upgrade summary to the cinematic numbers version
                    const s = (migratedCareer.summary || '').toLowerCase()
                    if (s.startsWith('strategic it manager') || s.startsWith('it manager with') || s === '') {
                        migratedCareer.summary = `15 sites. 1,000+ users. 99.9% uptime. Zero data breaches on my watch.\n\nIT Manager with 10+ years building secure, resilient enterprise environments across multi-site operations in East Africa. Specialising in hybrid cloud (Azure & AWS), Microsoft 365 governance, SD-WAN architecture, and cybersecurity frameworks that hold under real-world pressure. Recognised for closing the gap between IT strategy and business outcomes, and for being the IT leader who picks up the phone at 02:00 when the network breaks.\n\nCurrently running end-to-end ICT operations for KOFISI Africa, supporting a high-profile client portfolio spanning AWS, DHL, Bolt, Sony, GIZ, VillageReach, and the Bill & Melinda Gates Foundation across 15 business centres and 1,000+ users.`
                    }

                    // ─ Positioning statement (line visible on header below pillar row)
                    if (!migratedCareer.positioningStatement) {
                        migratedCareer.positioningStatement = 'The IT leader who runs 15 sites like one, and shows up at 02:00 when it counts.'
                    }

                    // ─ Stats strip (bottom band of header, the ROI headline)
                    if (!migratedCareer.statsStrip || migratedCareer.statsStrip.length === 0) {
                        migratedCareer.statsStrip = ['10+ Years', '15 Sites', '2,000+ Users', '99.9% Uptime']
                    }

                    // ─ Referees
                    if (!migratedCareer.referees) {
                        migratedCareer.referees = 'Professional references will be provided upon request.'
                    }

                    // ─ Enable referees section
                    migratedCareer.sectionVisibility = {
                        ...migratedCareer.sectionVisibility,
                        referees: true,
                    }
                }

                if (version < 14) {
                    // Sweep ALL text fields — replace em-dashes with natural human punctuation
                    // Em-dash is the single biggest AI writing fingerprint. Replace with comma.
                    const deEmDash = (text) => {
                        if (typeof text !== 'string') return text
                        return text.replace(/\s*\u2014\s*/g, ', ')
                    }

                    if (migratedCareer.summary)
                        migratedCareer.summary = deEmDash(migratedCareer.summary)

                    if (migratedCareer.positioningStatement)
                        migratedCareer.positioningStatement = deEmDash(migratedCareer.positioningStatement)

                    if (migratedCareer.executiveScale)
                        migratedCareer.executiveScale = deEmDash(migratedCareer.executiveScale)

                    if (migratedCareer.referees)
                        migratedCareer.referees = deEmDash(migratedCareer.referees)

                    if (Array.isArray(migratedCareer.strategicImpact))
                        migratedCareer.strategicImpact = migratedCareer.strategicImpact.map(deEmDash)

                    if (Array.isArray(migratedCareer.keyAchievements))
                        migratedCareer.keyAchievements = migratedCareer.keyAchievements.map(deEmDash)

                    if (Array.isArray(migratedCareer.experiences)) {
                        migratedCareer.experiences = migratedCareer.experiences.map(exp => ({
                            ...exp,
                            scope: deEmDash(exp.scope),
                            flagshipBullet: deEmDash(exp.flagshipBullet),
                            achievements: Array.isArray(exp.achievements)
                                ? exp.achievements.map(a => ({ ...a, text: deEmDash(a.text) }))
                                : exp.achievements,
                        }))
                    }
                }

                if (version < 15) {
                    // ─ Stats strip: 5-stat version with budget + uptime
                    migratedCareer.statsStrip = ['8+ Years', '15 Sites', '1,000+ Users', '$4M+ Budget', '99.9% Uptime']

                    // ─ Positioning statement: board authority, not marketing slogan
                    migratedCareer.positioningStatement = 'Enterprise IT leadership across 15 sites, 1,000+ users, and zero data breaches on record.'

                    // ─ Disable referees section (cleaner, more senior)
                    migratedCareer.sectionVisibility = {
                        ...migratedCareer.sectionVisibility,
                        referees: false,
                    }

                    // ─ Add governance vocabulary to the governance/cybersecurity skill groups
                    const govKeywords = [
                        'ISO 27001 Alignment', 'IT Governance Frameworks', 'Audit Readiness',
                        'Risk Register Management', 'Business Continuity Planning',
                        'Compliance Leadership', 'IT Policy Development'
                    ]
                    if (!migratedCareer.skills) migratedCareer.skills = {}
                    const existingGov = (migratedCareer.skills.governance || []).map(s => s.toLowerCase())
                    const newGov = govKeywords.filter(k => !existingGov.some(e => e.includes(k.toLowerCase().split(' ')[0])))
                    if (newGov.length > 0) {
                        migratedCareer.skills.governance = [
                            ...(migratedCareer.skills.governance || []),
                            ...newGov,
                        ]
                    }

                    // ─ Add leadership scope + budget to career highlights (if not already present)
                    const impacts = migratedCareer.strategicImpact || migratedCareer.keyAchievements || []
                    const hasReports = impacts.some(i => i && i.toLowerCase().includes('report'))
                    const hasBudget  = impacts.some(i => i && i.toLowerCase().includes('budget'))

                    const newImpacts = [...impacts]
                    if (!hasReports) {
                        newImpacts.push('Directed a team of 25+ direct and indirect reports across IT operations, infrastructure, and security functions.')
                    }
                    if (!hasBudget) {
                        newImpacts.push('Managed a $4M+ annual IT budget, optimising vendor contracts and infrastructure investments to deliver measurable cost efficiencies.')
                    }

                    if (migratedCareer.strategicImpact) {
                        migratedCareer.strategicImpact = newImpacts
                    } else if (migratedCareer.keyAchievements) {
                        migratedCareer.keyAchievements = newImpacts
                    }

                    // ─ Add strategic leadership language to summary if not present
                    if (migratedCareer.summary && !migratedCareer.summary.toLowerCase().includes('executive leadership')) {
                        migratedCareer.summary = migratedCareer.summary.trim() + '\n\nPartnered with executive leadership to align IT investment with business growth priorities, ensuring technology strategy directly supports organisational objectives and long-term scalability.'
                    }
                }

                if (version < 16) {
                    // ─ Fix Software Development cert year (Power Learn Project) from 2014 → 2024
                    if (Array.isArray(migratedCareer.certifications)) {
                        migratedCareer.certifications = migratedCareer.certifications.map(c => {
                            if (c.name && c.name.toLowerCase().includes('software development') && String(c.year) === '2014') {
                                return { ...c, year: '2024' }
                            }
                            return c
                        })

                        // ─ Sort certs: desc by year, but CCNA forced to slot #3 (index 2)
                        const isCCNA = c => c.name && (c.name.toLowerCase().includes('ccna') || c.name.toLowerCase().includes('cisco certified network associate'))
                        const ccnaCerts = migratedCareer.certifications.filter(isCCNA)
                        const otherCerts = migratedCareer.certifications.filter(c => !isCCNA(c))

                        // Sort others by year descending
                        otherCerts.sort((a, b) => {
                            const ya = parseInt(String(a.year || '0').replace(/\D/g, '')) || 0
                            const yb = parseInt(String(b.year || '0').replace(/\D/g, '')) || 0
                            return yb - ya
                        })

                        // Insert CCNA at index 2 (position #3)
                        if (ccnaCerts.length > 0) {
                            otherCerts.splice(2, 0, ...ccnaCerts)
                        }
                        migratedCareer.certifications = otherCerts
                    }

                    // ─ Clean education: remove en-dash artifacts from degree + field strings
                    if (Array.isArray(migratedCareer.education)) {
                        migratedCareer.education = migratedCareer.education.map(edu => ({
                            ...edu,
                            degree: edu.degree ? edu.degree.replace(/\s*[–—]\s*/g, ', ') : edu.degree,
                            field:  edu.field  ? edu.field.replace( /\s*[–—]\s*/g, ', ') : edu.field,
                        }))
                    }

                    // ─ Ensure stats strip entries have no trailing commas
                    if (Array.isArray(migratedCareer.statsStrip)) {
                        migratedCareer.statsStrip = migratedCareer.statsStrip.map(s => s.replace(/,+$/, '').trim())
                    }
                }

                return { ...persistedState, career: migratedCareer }
            }
        }
    )
)

export default useCareerStore
