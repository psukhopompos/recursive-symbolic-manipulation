# Financial Crystal Gazer

A retro-themed financial therapist application using metaphorical questions to analyze your financial psyche, powered by Azure OpenAI.

## Description

The Financial Crystal Gazer simulates a 1984-era financial therapy application. It guides users through a 10-question adaptive ritual using metaphorical choices to analyze their financial attitudes, behaviors, and mindset. The application provides insights into the user's relationship with money based on their interactions with the "crystal ball."

**Features:**

*   Retro 80s synthwave aesthetic with dynamic grid background and crystal ball effects.
*   Adaptive questioning engine powered by Azure OpenAI.
*   Analysis of financial psyche parameters (e.g., risk tolerance, urgency) based on metaphorical choices.
*   Asynchronous processing model with status updates via polling.
*   Final comprehensive analysis report after 10 questions.

## Project Structure

```
/financial-crystal/
├── server/                   # All backend-specific code
│   ├── app.js                # Express app configuration (middleware, routes)
│   ├── index.js              # Entry point to start the server (imports app)
│   ├── config/               # Configuration files (e.g., env.js)
│   ├── middleware/           # Custom middleware (e.g., errorHandler.js, requestLogger.js)
│   ├── prompts/              # LLM Prompts used by the backend
│   │   └── sns_msm_prompt.txt
│   ├── routes/               # API route definitions (apiRoutes.js)
│   ├── services/             # Business logic (openaiService.js)
│   └── utils/                # Helper functions (parser.js, logger.js, constants.js)
│
├── public/                   # Static files served directly to the browser
│   ├── index.html            # Main HTML file
│   ├── js/                   # Frontend JavaScript (script.js)
│   ├── css/                  # Frontend CSS (style.css)
│   └── assets/               # Images, fonts, sounds
│
├── tools/                    # Developer utility scripts
│   └── generate-grid.js      # Script to generate the perspective grid background
│
├── .env                      # Local environment variables (ignored by git)
├── .env.example              # Example environment variables
├── .gitignore
├── package.json
├── eslint.config.js          # ESLint configuration
└── README.md                 # This file
```

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/financial-crystal.git
    cd financial-crystal
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *Note: `tools/generate-grid.js` requires `canvas`. If you encounter issues installing `canvas` (it has system dependencies like `cairo`, `pango`, `libjpeg`, `giflib`), you might skip its installation (`npm install --ignore-scripts`) if you don't need to regenerate the grid background, or follow platform-specific instructions for `node-canvas`.*

3.  **Set up environment variables:**
    *   Copy `.env.example` to `.env`.
    *   Update `.env` with your Azure OpenAI credentials (see Azure Integration section below).
4.  **(Optional) Generate Grid Background:**
    If you have `canvas` installed correctly, you can generate/update the background:
    ```bash
    npm run generate:grid
    ```
    This will create `public/assets/grid-bg.png`.

5.  **Start the server:**
    *   For development (with auto-restarting):
        ```bash
        npm run dev
        ```
    *   For production:
        ```bash
        npm start
        ```
6.  **Access the application:**
    Open your browser and navigate to `http://localhost:3000` (or the port specified in `.env`).


## Supabase Integration (Optional Logging)

To enable logging of user interactions for analysis and product improvement, you can optionally configure Supabase:

1.  **Supabase Setup:**
    *   Create a Supabase project at [supabase.com](https://supabase.com/).
    *   Go to the SQL Editor and create a table to store interactions. Example schema:
      ```sql
      CREATE TABLE user_interactions (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        session_id TEXT,
        iteration INTEGER,
        question_text TEXT,
        user_choice TEXT,
        avoided_metaphors TEXT[], -- Store as array of text
        derived_parameters JSONB, -- Store JSON parameters
        llm_debug_info TEXT,
        is_final_analysis BOOLEAN DEFAULT FALSE
      );
      ```
    *   Enable Row Level Security (RLS) on the table (recommended), but ensure your Service Role has necessary permissions (by default it bypasses RLS).
2.  **Credentials:**
    *   In your Supabase project settings (API section), find your **Project URL**.
    *   Find your **`service_role` secret key**. *Important: Use the service role key on the backend for security, as it bypasses RLS.*
3.  **Configure `.env` file:**
    Add your Supabase details:
    ```dotenv
    SUPABASE_URL="https://your-project-ref.supabase.co"
    SUPABASE_SERVICE_KEY="your_supabase_service_role_key"
    ```

*Note: Interaction logging features will be disabled if Supabase credentials are missing or invalid.*

## Azure OpenAI Integration

This application requires access to an Azure OpenAI resource.

1.  **Azure Setup:**
    *   Create an Azure OpenAI resource.
    *   Deploy a chat model (e.g., `gpt-35-turbo`, `gpt-4`). Note the **Deployment Name**.
2.  **Credentials:**
    *   Get your Azure OpenAI resource **Endpoint URL** (e.g., `https://your-resource-name.openai.azure.com/`) and an **API Key**.
3.  **Configure `.env` file:**
    Add your credentials and deployment details:
    ```dotenv
    AZURE_API_KEY="your_api_key_here"
    AZURE_API_BASE="https://your-resource-name.openai.azure.com/"
    DEPLOYMENT_NAME="your_deployment_name"
    # AZURE_API_VERSION="2024-05-01-preview" # Optional: Default used if unset
    ```

*Note: LLM features will fail if Azure credentials are missing or invalid.*

## How It Works

1.  **Initiation:** User starts the consultation via the frontend (`public/index.html`).
2.  **Question Request:** Frontend (`public/js/script.js`) sends the current `session_state` to the backend (`POST /api/get_question`).
3.  **Backend Processing:**
    *   Server (`server/routes/apiRoutes.js`) accepts the request, generates a unique `sessionId`, stores the initial state, and responds `202 Accepted` with `{ status: 'processing', sessionId: '...' }`.
    *   In the background, `openaiService.js` formats a prompt and calls Azure OpenAI.
    *   The LLM response is parsed (`server/utils/parser.js`).
    *   The result (or error) is stored associated with the `sessionId`.
4.  **Polling:** Frontend polls `POST /api/get_result?sessionId=...`.
5.  **Result Retrieval & Logging:** Backend checks status. If done, it retrieves the result, **asynchronously logs the interaction details to Supabase (if configured)**, clears session data, and returns the result/error.
6.  **UI Update:** Frontend renders the new question/options or final analysis.
7.  **User Selection & State Update:** User selects an option. Frontend updates `session_state` and triggers step 2 again.
8.  **Repeat:** Steps 2-7 repeat for 10 iterations.
9.  **Final Analysis:** After iteration 10, the backend generates and returns the final analysis structure.

## API Endpoints (Backend)

*   `GET /`: Serves the main `index.html` page (via static middleware).
*   `POST /api/get_question`: Initiates background processing for the next question/analysis.
    *   Body: `{ session_state: { iteration: number, history: [...] } }`
    *   Response (202): `{ status: 'processing', sessionId: '...' }`
*   `POST /api/get_result?sessionId=...`: Polls for the result of a processing request.
    *   Body: (Empty)
    *   Response (200 - Processing): `{ status: 'processing', elapsedMs: ... }`
    *   Response (200 - Success): `{ iteration: ..., question: ..., options: [...], images: [...], debugContent: ..., psyche_parameters: {...} }` OR `{ final_analysis: { html: ..., metrics: {...} } }`
    *   Response (4xx/5xx - Error): `{ error: 'ERROR_CODE', message: '...' }`
*   Static Files: Serves all files from the `public/` directory.

## Technologies Used

*   **Backend:** Node.js, Express.js, node-fetch
*   **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
*   **AI:** Azure OpenAI Service
*   **Database (Optional Logging):** Supabase (PostgreSQL)
*   **Styling:** Retrowave/Synthwave aesthetic, CSS variables, animations.
*   **Font:** Lazer84

## Credits

*   **Concept & LLM Prompting:** Inspired by metaphorical analysis techniques.
*   **Font:** Lazer84 by Sunrise Digital
*   **Sound Effects:** SoundJay.com
*   **Images:** Unsplash (via source.unsplash.com)
*   **LLM Provider:** Microsoft Azure OpenAI Service

## License

MIT