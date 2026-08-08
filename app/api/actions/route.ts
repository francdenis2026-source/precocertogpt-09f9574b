import { getChatGPTUser } from "../../chatgpt-auth";
import { getD1 } from "../../../db/runtime";

function localUser(request: Request) {
  const host = new URL(request.url).hostname;
  return host === "localhost" || host === "127.0.0.1" ? "local-preview" : null;
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    const userId = user?.userId ?? localUser(request);
    if (!userId) return Response.json({ error: "Entre para salvar esta ação." }, { status: 401 });

    const payload = await request.json() as { action?: string; entityType?: string; entityId?: string; data?: unknown };
    if (!payload.action || !payload.entityType || !payload.entityId) {
      return Response.json({ error: "Ação incompleta." }, { status: 400 });
    }

    const db = getD1();
    await db.prepare(`CREATE TABLE IF NOT EXISTS user_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, action, entity_type, entity_id))`).run();
    await db.prepare(`INSERT INTO user_actions (user_id, action, entity_type, entity_id, payload) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, action, entity_type, entity_id) DO UPDATE SET payload = excluded.payload, created_at = CURRENT_TIMESTAMP`).bind(userId, payload.action, payload.entityType, payload.entityId, JSON.stringify(payload.data ?? {})).run();
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível salvar." }, { status: 500 });
  }
}
