# 🦊 Vulpi - Fakturační a ERP Systém

Vulpi je moderní, robustní webová aplikace navržená pro komplexní správu firemní agendy, fakturace, skladového hospodářství a vztahů se zákazníky (CRM).

Projekt je postaven jako **Monorepo** využívající **TurboRepo**, což zajišťuje efektivní správu kódu pro frontend i backend na jednom místě.

## � Použité Technologie

*   **Monorepo Management:** TurboRepo
*   **Backend:** NestJS (Node.js framework), TypeScript
*   **Frontend:** Next.js (React framework), Tailwind CSS, Shadcn UI
*   **Databáze:** PostgreSQL, Prisma ORM
*   **Autentizace:** Passport.js, Google OAuth, WebAuthn (Passkeys), 2FA (TOTP)
*   **Práce se soubory:** Generování PDF (Puppeteer/PDFKit), ISDOC formáty
*   **Validace:** Zod, Class-validator

## ✨ Hlavní Funkce Aplikace

### 🔐 Autentizace a Bezpečnost
*   **Hybridní přihlášení:** Podpora klasického hesla, Google SSO a Magic Links.
*   **Passkeys (WebAuthn):** Moderní přihlášení bez hesel (FaceID, TouchID, YubiKey).
*   **Dvoufázové ověření (2FA):** Zabezpečení pomocí autentikátorů (Google Authenticator).
*   **Správa relací:** Monitorování aktivních zařízení a sessions.

### 👥 Uživatelské Role (RBAC)
Systém využívá pokročilé řízení přístupu na základě rolí:
*   **SUPERADMIN:** Plný přístup k celému systému a globální konfiguraci.
*   **MANAGER:** Správa firem, uživatelů a obchodní logiky.
*   **ACCOUNTANT (Účetní):** Přístup k fakturám, bankovním výpisům a reportům.
*   **USER:** Běžný uživatel s přístupem k přiřazeným agendám.
*   **CLIENT:** Omezený přístup pro koncové zákazníky (klientský portál).

### 📄 Fakturace a Doklady
*   Vytváření, editace a správa faktur (vydané, přijaté).
*   Generování **PDF** faktur s QR kódem pro platbu.
*   Export do formátu **ISDOC** pro elektronickou výměnu dokladů.
*   Automatické číslování řad dokladů.

### 📦 Skladové Hospodářství
*   Správa produktů a ceníků.
*   Sledování stavu zásob na více skladech.
*   Příjemky a výdejky.

### 🏢 CRM (Správa Klientů)
*   Evidence firem a kontaktů.
*   Automatické načítání dat z **ARES** (dle IČO).
*   Historie komunikace a dokladů ke klientovi.

### 🏦 Bankovnictví
*   Import bankovních výpisů.
*   Párování plateb s fakturami.

## � Struktura Projektu

*   `apps/api` - Backendová aplikace (NestJS API).
*   `apps/web` - Frontendová klientská aplikace (Next.js).
*   `packages/database` - Sdílené Prisma schéma a databázový klient.
*   `packages/ui` - Sdílená knihovna UI komponent.
*   `packages/utils` - Pomocné funkce sdílené napříč aplikacemi.

## 🚀 Instalace a Spuštění

1.  **Instalace závislostí:**
    ```bash
    pnpm install
    ```

2.  **Nastavení prostředí:**
    Vytvořte `.env` soubory v `apps/api` a `apps/web` podle vzoru `.env.example`.

3.  **Spuštění databáze (Docker):**
    ```bash
    docker-compose up -d
    ```

4.  **Synchronizace databáze:**
    ```bash
    pnpm db:push
    ```

5.  **Spuštění vývojového serveru:**
    ```bash
    pnpm dev
    ```
