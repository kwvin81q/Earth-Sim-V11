EARTH-SIM v11 — ASK AI

This build adds a real OpenAI-backed Ask AI screen. The API key is NOT stored in index.html.

DEPLOYMENT (Cloudflare Pages with Git integration):
1. Put index.html, manifest.webmanifest, sw.js, and the functions folder in the repository root.
2. Connect the GitHub repository to a Cloudflare Pages project. Pages Functions are deployed from the /functions directory when deployed through Git integration/Wrangler.
3. In Cloudflare: Workers & Pages > your Pages project > Settings > Variables and Secrets > Add.
4. Add OPENAI_API_KEY as an encrypted Secret.
5. Optional: add OPENAI_MODEL as a normal variable if you want to override the default model.
6. Redeploy, open the site, choose Ask AI, and ask a question.

IMPORTANT: Never paste the OpenAI API key into index.html, JavaScript shipped to the browser, GitHub, or manifest.webmanifest.
