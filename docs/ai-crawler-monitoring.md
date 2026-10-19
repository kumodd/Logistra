# AI crawler monitoring

Logistra is deployed on Vercel. The repository does not contain an application access-log pipeline, middleware bot classifier, or crawler database. Use the Vercel request logs or an existing Vercel log drain for monitoring; do not add a new database just to track crawler visits.

## What to record

For public requests, retain only what is needed for operational checks:

- timestamp
- source IP while verification is needed
- request path without query-string data
- response status and response bytes
- user-agent candidate
- verified classification: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, or `unverified`

Do not collect form bodies or unrelated personal data. After verification, IP retention should follow the site's normal log-retention policy.

## Verify crawler identity

Never classify a request from its user-agent string alone. Refresh the official CIDR lists before an audit and compare the source IP against the published ranges:

```sh
curl -fsS https://openai.com/searchbot.json
curl -fsS https://openai.com/chatgpt-user.json
curl -fsS https://openai.com/gptbot.json
```

Use the request user-agent as a candidate label, then require the source IP to be in the matching official list. Keep the lists current because OpenAI can change the published ranges.

The official user-agent candidates are:

- `OAI-SearchBot` — automatic ChatGPT Search crawling
- `ChatGPT-User` — a page fetch initiated by a ChatGPT user; it is not automatic search crawling
- `GPTBot` — model-training-related crawling; it is allowed for public pages by this site's robots policy

## What to check regularly

1. Confirm `https://www.logistra.in/robots.txt` still contains explicit allow rules for OAI-SearchBot, ChatGPT-User, and GPTBot.
2. Review verified requests for public paths, status codes, and repeated failures.
3. Check that `/`, `/how-it-works`, `/services`, `/technology`, `/about`, and `/contact` return `200` HTML.
4. Check `https://www.logistra.in/sitemap.xml` for canonical `www` URLs and valid XML.
5. Investigate any WAF, rate-limit, or deployment change that returns `403`, `429`, or a challenge page to a verified crawler.

Robots changes are advisory and are not authentication or access control. Keep private routes protected by the hosting and application authorization layer.

Official reference: https://developers.openai.com/api/docs/bots
