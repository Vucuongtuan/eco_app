Recommendation service (lightweight) — consumes behavior events and serves recommendations.

Run locally (recommended in venv)

Requirements: Python 3.13.x (recommended). Recent Python 3.14 can trigger a `pydantic-core` build requiring a Rust toolchain.

Using `pyenv` (recommended):

```bash
pyenv install 3.13.9
pyenv local 3.13.9
python -m venv .venv
source .venv/bin/activate
python -m pip install -U pip setuptools wheel
pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Example curl:

```bash
curl -X POST http://localhost:8001/api/v1/recommend/ -H 'Content-Type: application/json' -d '{"user_id":"user123","limit":5}'
```

If you must use Python 3.14, set `PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1` and ensure a Rust toolchain is installed (builds will compile `pydantic-core` from source):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
export PYO3_USE_ABI3_FORWARD_COMPATIBILITY=1
pip install -r requirements.txt
```

