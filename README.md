# Inner Landscape Illuminator (ILI)

*A playful, neon‑lit journey through metaphor that shines a light on hidden emotions, blockages, and shadow dynamics.*

---

## What is ILI?
ILI is a **10‑invitation ritual** powered by Azure OpenAI. At each step the LLM—taking on the persona of a *Metaphorical Cartographer*—offers seven vivid pathways (metaphors). The option the user selects is decoded into a small JSON bundle of potential hidden dynamics (e.g., `fear_of_emptiness`, `control_as_safety`, `flow_acceptance : 0.3`).

After ten rounds the engine synthesises the entire journey into a share‑ready HTML reflection, surfacing the user’s **Guiding Energy**, central **Inner Polarity**, and most salient **Illuminated Shadow**.

Originally built as *Financial Crystal Gazer*, the scaffold is now **domain‑agnostic**—any prompt placed in `/server/prompts/` can steer the ritual toward money, creativity, relationships, career, etc.

---

## Why Metaphor?
Metaphors slip beneath rational defenses, revealing subconscious patterns the analytical mind glosses over. Choosing between a *withered bonsai* and an *untamed jungle* tells us more than ticking a Likert scale.

---

## Anatomy of the Engine

| Layer | File | Role |
|-------|------|------|
| **System Prompt** | `server/prompts/sns_msm_prompt.txt` | Defines the *Metaphorical Cartographer* persona, the strict output envelope, and the rules for mapping choices to hidden‑dynamic JSON. |
| **Dynamic Invitation Prompt** | `openaiService.createQuestionPrompt()` | Injects session history + iteration count; instructs the model to craft the next invitation and exactly **seven** pathways. |
| **Final‑Analysis Prompt** | `openaiService.createFinalAnalysisPrompt()` | After invitation 10, requests an HTML dossier wrapped in `<final_analysis>` tags. |
| **Parser** | `server/utils/parser.js` | Extracts the question, options, and per‑pathway JSON; aggregates numeric fields; passes HTML straight to the frontend. |

*(The hard regex expects the “→ { … }” mapping for each line—keep that arrow!)*

---

## Quick Start
```bash
# 1  Clone & install
git clone https://github.com/your‑username/ili.git
cd ili
npm install     # add --ignore-scripts if canvas fails

# 2  Config
cp .env.example .env     # add AZURE_API_KEY, AZURE_API_BASE, DEPLOYMENT_NAME

# 3  Run (dev)
npm run dev
# visit http://localhost:3000
```

---

## Switching Domains
1. Copy `sns_msm_prompt.txt` → `career_prompt.txt` (or similar).
2. Rewrite **only the prose** inside the prompt; leave the *output‑format* section intact.
3. Point `getSystemPrompt()` to your new file or set `PROMPT_FILE` env var.
4. Restart the server—ILI now explores that theme.

---

## Project Structure
```
/ili/
├── server/          # Express backend, prompt loaders, OpenAI service
├── public/          # Vanilla JS frontend (index.html, script.js, style.css)
├── tools/           # generate-grid.js for the CRT synthwave background
├── prompts/         # <–– place your *.txt prompt modules here
└── README.md
```

---

## Tech Highlights
* **LLM Core:** Azure OpenAI chat model, `max_completion_tokens` 4 000 for invitations, 2 000 for final reflection.
* **Parser:** Regex‑driven, tolerant of boolean/string/number JSON values, auto‑aggregates numerics across iterations.
* **Frontend:** Animated synthwave grid, option cards fade/slide in, optional debug snippet reveal.
* **Optional DB:** Supabase service‑role insert for interaction analytics (see `.env.example`).

---

## Contributing
Got a new prompt module or UI polish? Open a PR. Include a short GIF or screenshot of your ritual in action.

---

## License
MIT

