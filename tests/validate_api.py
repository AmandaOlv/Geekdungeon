"""Valida os endpoints da API contra o SQL Server (ambiente local)."""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "http://127.0.0.1:8000"


def request(method: str, path: str, body: dict | None = None, expected: int = 200):
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=data,
        method=method,
        headers={"Content-Type": "application/json"} if body is not None else {},
    )
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as error:
        status = error.code
        raw = error.read().decode("utf-8")
    payload = json.loads(raw) if raw else None
    if status != expected:
        raise AssertionError(f"{method} {path} -> {status} (esperado {expected}): {payload}")
    return payload


def main() -> None:
    stamp = str(int(time.time()))
    cat_nome = f"QA Cat {stamp}"
    prod_nome = f"QA Prod {stamp}"

    health = request("GET", "/health")
    assert health["status"] == "healthy"

    cat = request("POST", "/categorias", {"nome": cat_nome}, 201)
    assert cat["nome"] == cat_nome
    cat_id = cat["id"]

    dup = request("POST", "/categorias", {"nome": cat_nome.lower()}, 400)
    assert "já existe" in dup["detail"]

    got = request("GET", f"/categorias/{cat_id}")
    assert got["id"] == cat_id

    listed = request("GET", "/categorias")
    assert any(item["id"] == cat_id for item in listed)

    updated = request("PUT", f"/categorias/{cat_id}", {"nome": cat_nome + " v2"})
    assert updated["nome"].endswith("v2")

    prod = request(
        "POST",
        "/produtos",
        {
            "nome": prod_nome,
            "descricao": "Item de teste",
            "preco_venda": 49.9,
            "quantidade_estoque": 2,
            "categoria_id": cat_id,
        },
        201,
    )
    assert prod["categoria_nome"].startswith("QA Cat")
    prod_id = prod["id"]

    missing_cat = request(
        "POST",
        "/produtos",
        {
            "nome": "X",
            "descricao": None,
            "preco_venda": 1,
            "quantidade_estoque": 1,
            "categoria_id": 999999,
        },
        400,
    )
    assert "não encontrada" in missing_cat["detail"]

    found = request("GET", f"/produtos?nome={urllib.parse.quote(prod_nome)}")
    assert any(item["id"] == prod_id for item in found)

    found_ci = request("GET", f"/produtos?nome={urllib.parse.quote(prod_nome.lower())}")
    assert any(item["id"] == prod_id for item in found_ci)

    by_cat = request("GET", f"/produtos?categoria_id={cat_id}")
    assert any(item["id"] == prod_id for item in by_cat)

    combo = request(
        "GET",
        f"/produtos?nome={urllib.parse.quote(prod_nome)}&categoria_id={cat_id}",
    )
    assert any(item["id"] == prod_id for item in combo)
    assert request(
        "GET",
        f"/produtos?nome={urllib.parse.quote(prod_nome)}&categoria_id=999999",
    ) == []

    wild = request("GET", "/produtos?nome=%25")
    assert all("%" in item["nome"] for item in wild)

    spaced = request(
        "POST",
        "/produtos",
        {
            "nome": f"QA Espaco {stamp}",
            "descricao": "   ",
            "preco_venda": 10,
            "quantidade_estoque": 0,
            "categoria_id": cat_id,
        },
        201,
    )
    assert spaced["descricao"] in (None, "")
    assert spaced["tem_estoque"] is False
    request("DELETE", f"/produtos/{spaced['id']}", expected=204)

    trimmed = request("POST", "/categorias", {"nome": f"  QA Trim {stamp}  "}, 201)
    assert trimmed["nome"] == f"QA Trim {stamp}"
    request("DELETE", f"/categorias/{trimmed['id']}", expected=204)

    zero = request("PUT", f"/produtos/{prod_id}", {"preco_venda": 0})
    assert float(zero["preco_venda"]) == 0

    plus = request("POST", f"/produtos/{prod_id}/estoque", {"delta": 1})
    assert plus["quantidade_estoque"] == 3

    minus = request("POST", f"/produtos/{prod_id}/estoque", {"delta": -1})
    assert minus["quantidade_estoque"] == 2

    request("POST", f"/produtos/{prod_id}/estoque", {"delta": -99}, 400)

    blocked = request("DELETE", f"/categorias/{cat_id}", expected=400)
    assert "produto" in blocked["detail"].lower()

    request("DELETE", f"/produtos/{prod_id}", expected=204)
    request("GET", f"/produtos/{prod_id}", expected=404)
    request("DELETE", f"/categorias/{cat_id}", expected=204)
    request("GET", f"/categorias/{cat_id}", expected=404)

    reused = request("POST", "/categorias", {"nome": cat_nome + " v2"}, 201)
    request("DELETE", f"/categorias/{reused['id']}", expected=204)

    print("OK: todas as funcionalidades da API passaram.")


if __name__ == "__main__":
    main()
