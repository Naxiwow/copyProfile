<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:09090d,50:1e1b4b,100:4f46e5&height=200&section=header&text=CopyProfile&fontSize=60&fontColor=f5f5f5&animation=fadeIn&fontAlignY=38&desc=Clone%20any%20Discord%20profile%20onto%20yours&descAlignY=58&descSize=16&descColor=a3a3a3" width="100%"/>

<br/>

[![Equicord](https://img.shields.io/badge/Equicord-4f46e5?style=for-the-badge&logo=discord&logoColor=white&labelColor=09090d)](https://github.com/Equicord/Equicord)
[![GitHub](https://img.shields.io/badge/Naxiwow-4f46e5?style=for-the-badge&logo=github&logoColor=white&labelColor=09090d)](https://github.com/Naxiwow)

</div>

---

## About

Equicord plugin that adds a **Copy Profile** option when you right-click any user. Pick exactly what you want to grab and it applies directly to your own account.

---

## Features

- **Avatar** — copies their profile picture
- **Banner** — copies their banner
- **Display Name** — copies their global name
- **Bio** — copies their bio
- **Accent Color** — copies their profile color
- Each element is individually toggleable — take one or all five
- Works on any user you can view

---

## Usage

Right-click any user → **Copy Profile** → check what you want → **Copy**

---

## Installation

Drop the `copyProfile` folder into `src/userplugins/` in your Equicord source, then:

```bash
pnpm build
```

Restart Discord → Settings → Plugins → enable **CopyProfile**.

---

## Notes

- Animated avatars and banners (GIF) require Nitro to actually apply on your account
- Status is not included — Discord's custom status uses a different API (protobuf)

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4f46e5,50:1e1b4b,100:09090d&height=120&section=footer" width="100%"/>
</div>