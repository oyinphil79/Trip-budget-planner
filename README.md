# Receipt Agent

Upload a receipt (PDF, PNG, JPG or WEBP, up to 8 MB). The agent reads it into JSON with OpenAI, checks the arithmetic in code, converts the total to INR and adds it to a spending log kept in your browser.

## Run

```bash
npm install
npm run dev
```

Paste your OpenAI key in the field at the top of the page. It is kept in `sessionStorage` (`openai-key`) and sent as the `x-openai-key` header. If you don't paste one, the server uses `OPENAI_API_KEY` (see `.env.example`).

## How it fits together

| File | Job |
| --- | --- |
| `app/page.tsx` | State and the two-column layout |
| `app/api/read/route.ts` | Upload checks (type, magic bytes, size) and the key fallback |
| `lib/agent.ts` | Responses API call with a strict `json_schema` output |
| `lib/models.ts` | Model table: `gpt-5-mini` (`minimal`) and `gpt-6.1-sol` (`none`) |
| `lib/check.ts` | Adds line amounts and taxes in integer cents and compares with the printed total |
| `lib/fx.ts` | INR rate from frankfurter.dev, with a rough fallback table |
| `components/*` | Header, upload card, receipt card, spending log |

The model is told to copy printed numbers and not to fix the arithmetic. Whether the total adds up is decided only in `lib/check.ts`.
