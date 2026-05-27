#!/usr/bin/env python3
"""Download official JUPAS annual admissions score PDFs."""

from __future__ import annotations

import argparse
import urllib.request
from pathlib import Path


URL_TEMPLATE = "https://www.jupas.edu.hk/f/page/3667/af_{year}_JUPAS.pdf"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("years", nargs="*", default=["2025"])
    parser.add_argument("--out-dir", default="data/raw/jupas")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for year in args.years:
        url = URL_TEMPLATE.format(year=year)
        out = out_dir / f"af_{year}_JUPAS.pdf"
        urllib.request.urlretrieve(url, out)
        print(f"downloaded {url} -> {out}")


if __name__ == "__main__":
    main()
