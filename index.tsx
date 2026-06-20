/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findGroupChildrenByChildId, NavContextMenuPatchCallback } from "@api/ContextMenu";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { Menu, React, RestAPI, Toasts, UserStore } from "@webpack/common";

async function getProfile(userId: string) {
    const res = await RestAPI.get({ url: `/users/${userId}/profile?with_mutual_guilds=false` });
    return res.body;
}

async function toDataUrl(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function avatarUrl(userId: string, hash: string) {
    return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=1024`;
}

function bannerUrl(userId: string, hash: string) {
    return `https://cdn.discordapp.com/banners/${userId}/${hash}.${hash.startsWith("a_") ? "gif" : "png"}?size=1024`;
}

function Checkbox({ label, sub, checked, onChange, disabled }: {
    label: string;
    sub?: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <div
            onClick={disabled ? undefined : onChange}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                background: checked ? "rgba(88,101,242,0.12)" : "rgba(255,255,255,0.04)",
                border: `1.5px solid ${checked ? "rgba(88,101,242,0.45)" : "transparent"}`,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.38 : 1,
                userSelect: "none" as const,
            }}
        >
            <div style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                flexShrink: 0,
                background: checked ? "#5865f2" : "rgba(255,255,255,0.08)",
                border: `2px solid ${checked ? "#5865f2" : "rgba(255,255,255,0.25)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{label}</div>
                {sub && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sub}
                    </div>
                )}
            </div>
        </div>
    );
}

function CopyProfileModal({ rootProps, userId }: { rootProps: any; userId: string; }) {
    const [loading, setLoading] = React.useState(true);
    const [profile, setProfile] = React.useState<any>(null);
    const [err, setErr] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [opts, setOpts] = React.useState({
        displayName: true,
        bio: true,
        accentColor: true,
        avatar: true,
        banner: true,
    });

    React.useEffect(() => {
        getProfile(userId)
            .then(p => { setProfile(p); setLoading(false); })
            .catch(() => { setErr("Couldn't load this profile."); setLoading(false); });
    }, [userId]);

    const toggle = (k: keyof typeof opts) => setOpts(p => ({ ...p, [k]: !p[k] }));

    const user = profile?.user;
    const up = profile?.user_profile;

    const hasName = !!user?.global_name;
    const hasBio = typeof up?.bio === "string" && up.bio.length > 0;
    const hasColor = user?.accent_color != null;
    const hasAvatar = !!user?.avatar;
    const hasBanner = !!user?.banner;
    const noneSelected = !Object.values(opts).some(Boolean);

    const apply = async () => {
        if (!profile || noneSelected) return;
        setBusy(true);
        try {
            const body: Record<string, any> = {};
            if (opts.displayName && hasName) body.global_name = user.global_name;
            if (opts.bio) body.bio = hasBio ? up.bio : "";
            if (opts.accentColor) body.accent_color = hasColor ? user.accent_color : null;
            if (opts.avatar && hasAvatar) body.avatar = await toDataUrl(avatarUrl(userId, user.avatar));
            if (opts.banner && hasBanner) body.banner = await toDataUrl(bannerUrl(userId, user.banner));

            await RestAPI.patch({ url: "/users/@me", body });
            Toasts.show({ message: "Profile copied ✓", type: Toasts.Type.SUCCESS, id: Toasts.genId() });
            rootProps.onClose();
        } catch (e: any) {
            Toasts.show({
                message: e?.body?.message ?? "Something went wrong.",
                type: Toasts.Type.FAILURE,
                id: Toasts.genId(),
            });
        }
        setBusy(false);
    };

    return (
        <ModalRoot {...rootProps} size="small">
            <ModalHeader separator={false}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    {hasAvatar && !loading && (
                        <img
                            src={avatarUrl(userId, user.avatar)}
                            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            alt=""
                        />
                    )}
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Copy Profile</div>
                        {!loading && user && (
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>@{user.username}</div>
                        )}
                    </div>
                </div>
                <ModalCloseButton onClick={rootProps.onClose} />
            </ModalHeader>

            <ModalContent style={{ padding: "12px 16px 16px" }}>
                {loading && (
                    <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "28px 0", fontSize: 14 }}>
                        Loading...
                    </div>
                )}
                {err && (
                    <div style={{ textAlign: "center", color: "#ed4245", padding: "28px 0", fontSize: 14 }}>{err}</div>
                )}
                {!loading && !err && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.28)", marginBottom: 6 }}>
                            Pick what to copy
                        </div>
                        <Checkbox label="Display Name" sub={user?.global_name ?? "Not set"} checked={opts.displayName} onChange={() => toggle("displayName")} disabled={!hasName} />
                        <Checkbox label="Bio" sub={hasBio ? (up.bio.slice(0, 48) + (up.bio.length > 48 ? "…" : "")) : "No bio"} checked={opts.bio} onChange={() => toggle("bio")} disabled={!hasBio} />
                        <Checkbox label="Profile Color" sub={hasColor ? `#${user.accent_color.toString(16).padStart(6, "0").toUpperCase()}` : "No color"} checked={opts.accentColor} onChange={() => toggle("accentColor")} disabled={!hasColor} />
                        <Checkbox label="Profile Picture" sub={hasAvatar ? "Available" : "Default avatar"} checked={opts.avatar} onChange={() => toggle("avatar")} disabled={!hasAvatar} />
                        <Checkbox label="Banner" sub={hasBanner ? "Available" : "No banner"} checked={opts.banner} onChange={() => toggle("banner")} disabled={!hasBanner} />
                    </div>
                )}
            </ModalContent>

            {!loading && !err && (
                <ModalFooter>
                    <button
                        onClick={rootProps.onClose}
                        style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 4, color: "#fff", cursor: "pointer", fontSize: 14, padding: "10px 20px", marginRight: 8 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={apply}
                        disabled={busy || noneSelected}
                        style={{
                            background: noneSelected ? "rgba(255,255,255,0.08)" : "#5865f2",
                            border: "none", borderRadius: 4, color: "#fff",
                            cursor: busy || noneSelected ? "not-allowed" : "pointer",
                            fontSize: 14, fontWeight: 700, padding: "10px 24px",
                            opacity: busy ? 0.7 : 1,
                        }}
                    >
                        {busy ? "Copying..." : "Copy"}
                    </button>
                </ModalFooter>
            )}
        </ModalRoot>
    );
}

const patchUserContext: NavContextMenuPatchCallback = (children, { user }) => {
    if (!user || user.id === UserStore.getCurrentUser()?.id) return;

    const group = findGroupChildrenByChildId("block", children)
        ?? findGroupChildrenByChildId("mention", children)
        ?? children;

    group.push(
        <Menu.MenuSeparator key="cp-sep" />,
        <Menu.MenuItem
            key="copy-profile"
            id="copy-profile"
            label="Copy Profile"
            action={() => openModal(props => <CopyProfileModal rootProps={props} userId={user.id} />)}
        />
    );
};

export default definePlugin({
    name: "CopyProfile",
    description: "Right-click any user → Copy Profile to clone their avatar, banner, bio, display name or accent color onto your own account.",
    authors: [{ name: "naxiwow", id: 875342291001278504n }],
    dependencies: ["ContextMenuAPI"],
    contextMenus: {
        "user-context": patchUserContext,
    },
});
