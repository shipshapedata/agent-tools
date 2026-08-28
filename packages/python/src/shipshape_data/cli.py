"""shipshape: CLI for the Shipshape Data public API. Keyless, read-only."""

from __future__ import annotations

import argparse
import json
import sys

from . import Client, ShipshapeError, __version__


def _print(data) -> None:
    print(json.dumps(data, indent=2, ensure_ascii=False))


def _print_result(result: dict) -> None:
    print(f"\nAI readiness: {result['score']}/100  {result['band']['name']}\n")
    for key, pillar in result["pillars"].items():
        bar = ("#" * round(pillar["average"] * 4)).ljust(20, ".")
        marker = "  <- weakest" if key == result["weakestPillar"] else ""
        print(f"  {pillar['title']:<20} [{bar}] {pillar['average']:.2f}{marker}")
    print()
    for line in result["band"]["guidance"]:
        print(f"  {line}\n")
    weakest = result["pillars"][result["weakestPillar"]]
    if weakest.get("advice"):
        print(f"  Where to start: {weakest['advice']}\n")
    print("  Interactive version: https://shipshapedata.com/ai-readiness/  Talk to us: hello@shipshapedata.com")


def _readiness(client: Client, as_json: bool) -> None:
    data = client.readiness_questions()
    answers: list[int] = []
    number = 0
    total = sum(len(s["questions"]) for s in data["sections"])
    print(f"\nShipshape Data AI readiness assessment ({total} questions, about three minutes)")
    for section in data["sections"]:
        print(f"\n{section['title']}  {section['desc']}")
        for question in section["questions"]:
            number += 1
            note = "" if question.get("scored") else "  (context only, not scored)"
            print(f"\n{number}. {question['q']}{note}")
            for i, opt in enumerate(question["opts"], 1):
                print(f"   {i}) {opt}")
            while True:
                raw = input(f"   your answer [1-{len(question['opts'])}]: ").strip()
                if raw.isdigit() and 1 <= int(raw) <= len(question["opts"]):
                    answers.append(int(raw) - 1)
                    break
                print(f"   a number between 1 and {len(question['opts'])}, please")
    result = client.score_readiness(answers)
    _print(result) if as_json else _print_result(result)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="shipshape",
        description="Shipshape Data CLI: services, case studies, 169 data & AI guides, and the AI readiness assessment. Keyless and read-only.",
        epilog="Docs: https://shipshapedata.com/developers/  MCP: https://shipshapedata.com/mcp",
    )
    parser.add_argument("--version", action="version", version=__version__)
    parser.add_argument("--json", action="store_true", help="raw JSON output")
    parser.add_argument("--api", default=None, help="API base (default https://shipshapedata.com/api)")
    sub = parser.add_subparsers(dest="command")

    services = sub.add_parser("services", help="the 13 services, or one by slug")
    services.add_argument("slug", nargs="?")
    sub.add_parser("industries", help="the 6 industry pages")
    cases = sub.add_parser("cases", help="the 3 case studies, or one by slug")
    cases.add_argument("slug", nargs="?")
    search = sub.add_parser("search", help="search 169 guides on data and AI")
    search.add_argument("query", nargs="+")
    search.add_argument("--category")
    search.add_argument("--limit", type=int, default=5)
    sub.add_parser("categories", help="the seven resource categories")
    ask = sub.add_parser("ask", help="ranked answers from the site's content")
    ask.add_argument("query", nargs="+")
    sub.add_parser("readiness", help="take the 16-question AI readiness assessment")
    score = sub.add_parser("score", help="score answers, e.g. 3,2,1,3,2,3,2,3,3,2,2,3,3,3,4,3")
    score.add_argument("answers")
    sub.add_parser("contact", help="how to reach the team")

    opts = parser.parse_args(argv)
    if not opts.command:
        parser.print_help()
        return 0
    client = Client(opts.api) if opts.api else Client()

    try:
        if opts.command == "services":
            _print(client.services(opts.slug))
        elif opts.command == "industries":
            _print(client.industries())
        elif opts.command == "cases":
            _print(client.case_studies(opts.slug))
        elif opts.command == "search":
            result = client.search_resources(" ".join(opts.query), category=opts.category, limit=opts.limit)
            if opts.json:
                _print(result)
            else:
                for hit in result["results"]:
                    print(f"{hit['title']}  [{hit['category']}]")
                    print(f"  {hit['description']}")
                    print(f"  {hit['url']}  (markdown: {hit['url']}index.md)\n")
        elif opts.command == "categories":
            _print(client.resource_categories())
        elif opts.command == "ask":
            _print(client.ask(" ".join(opts.query)))
        elif opts.command == "readiness":
            _readiness(client, opts.json)
        elif opts.command == "score":
            answers = [int(x) for x in opts.answers.split(",")]
            result = client.score_readiness(answers)
            _print(result) if opts.json else _print_result(result)
        elif opts.command == "contact":
            _print(client.contact())
    except ShipshapeError as err:
        print(err, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
