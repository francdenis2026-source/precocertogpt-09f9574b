declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
  }
}
interface Env extends Cloudflare.Env {}
