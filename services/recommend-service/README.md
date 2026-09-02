Recommendation service (lightweight) — consumes behavior events and serves recommendations.

Run locally (recommended in venv)

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Example curl:

```bash
curl -X POST http://localhost:8001/api/v1/recommend/ -H 'Content-Type: application/json' -d '{"user_id":"user123","limit":5}'
```
