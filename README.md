# Brújula — asistente personal de escritorio

Base de una aplicación local para organizar actividades profesionales, académicas y familiares/personales.

## Arquitectura

- Escritorio: Electron.
- Interfaz: React + Vite + Tailwind CSS.
- API local: Python + FastAPI + SQLAlchemy.
- Base temporal de desarrollo: SQLite (`backend/brujula-dev.db`).
- Base prevista: MySQL, cuando se disponga de acceso administrativo y se configure el usuario de la aplicación.

## Ejecutar ahora, sin MySQL

Requisitos: Node.js instalado y Python 3.10 o posterior. Las dependencias de JavaScript y Python ya se instalaron en este entorno.

Abre dos terminales de PowerShell.

**Terminal 1 — backend:**

```powershell
cd "C:\Users\SYM\Desktop\Agente personal\asistente-personal-psiquiatra\backend"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — aplicación de escritorio:**

```powershell
cd "C:\Users\SYM\Desktop\Agente personal\asistente-personal-psiquiatra"
npm run dev
```

La primera vez que arranque el backend, creará automáticamente `backend/brujula-dev.db` y la tabla de actividades. La documentación de la API estará en `http://127.0.0.1:8000/docs`.

Si existe `backend/.env` con una URL de MySQL, cambia temporalmente su `DATABASE_URL` a `sqlite:///./brujula-dev.db` para trabajar sin MySQL. Si no existe, el backend usa SQLite por defecto.

## Cuando configuremos MySQL

La estructura está prevista para usar la URL `mysql+pymysql://...` y el script `backend/database.sql` prepara una base `brujula` y un usuario restringido `brujula_app`. En ese momento se configura `DATABASE_URL` en `backend/.env`; la aplicación no debe conectarse como `root`.

## Límites de este prototipo

Permite registrar, buscar, filtrar, completar y eliminar actividades. Todavía no incluye inicio de sesión, cifrado de datos de la aplicación, sincronización, migraciones, instalador ni copias de seguridad. Usa datos ficticios o no sensibles y no registres nombres, historias clínicas ni datos que identifiquen pacientes.
