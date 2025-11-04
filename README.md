# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Bibliotekopol — demo frontend

    Prosty projekt React + TypeScript wygenerowany przez Vite i dostosowany jako prosty frontend demo dla specyfikacji "Bibliotekopol".

    Quick start (Windows PowerShell):

    ```powershell
    cd "c:\Users\kubas\OneDrive\Pulpit\szupsti"
    npm install
    npm run dev
    # otwórz http://localhost:5173
    ```

    Co zawiera implementacja:
    - Routing dla stron głównych (Home, Katalog książek)
    - Prosty kontekst autoryzacji (role: student, librarian, admin) z zapisem w localStorage
    - Katalog książek z wyszukiwaniem i prostym trybem wypożyczeń przechowywanym w localStorage

    To jest minimalne demo frontendowe. Backend API (REST, JWT) nie jest zaimplementowane w tym repozytorium — zamiast tego dane są mockowane i przechowywane lokalnie.
