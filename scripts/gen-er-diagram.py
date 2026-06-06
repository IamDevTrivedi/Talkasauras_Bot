#!/usr/bin/env python3
"""Generate Talkasauras Bot database ER diagram (light + dark) from .er markdown."""

import os
import re

from eralchemy2.main import all_to_intermediary, _intermediary_to_dot
from pygraphviz.agraph import AGraph

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "docs",
    "diagrams",
)
os.makedirs(OUT_DIR, exist_ok=True)

ER_FILE = os.path.join(OUT_DIR, "talkasauras-schema.er")
DIAGRAM_NAME = "er-diagram"


def apply_theme(dot, bg, fc, ec):
    dot = re.sub(
        r"<FONT(?! COLOR)( [^>]*)?>",
        lambda m: f"<FONT{m.group(1) or ''} COLOR=\"{fc}\">",
        dot,
    )
    dot = dot.replace(
        "graph [rankdir=LR];",
        "graph [rankdir=LR, bgcolor=\"{bg}\", fontcolor=\"{fc}\", dpi=\"150\", pad=\"0.5\", fontname=\"Helvetica Bold\", fontsize=\"18\"];".format(bg=bg, fc=fc),
    )
    dot = dot.replace(
        "edge [color=gray50,",
        "edge [color=\"{ec}\",".format(ec=ec),
    )
    dot = dot.replace(
        'node [label="\\N",\n            shape=plaintext',
        'node [label="\\N",\n            shape=plaintext,\n            fontcolor="{fc}"'.format(fc=fc),
    )
    return dot


def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg = "#0f0f13" if dark else "white"
    fc = "#e8e8ea" if dark else "#1e1e1e"
    ec = "#65656e" if dark else "#495057"

    tables, relationships = all_to_intermediary(ER_FILE)
    dot_source = _intermediary_to_dot(
        tables, relationships, title="Talkasauras Bot Database Schema"
    )
    themed = apply_theme(dot_source, bg, fc, ec)

    png_path = os.path.join(OUT_DIR, f"{DIAGRAM_NAME}{suffix}.png")
    graph = AGraph(string=themed)
    graph.draw(png_path, prog="dot", format="png")
    print(f"  Generated {png_path}")

    try:
        from PIL import Image
        img = Image.open(png_path)
        ratio = img.size[0] / img.size[1]
        print(f"  Aspect ratio: {ratio:.2f} ({img.size[0]}x{img.size[1]})")
    except ImportError:
        pass


if __name__ == "__main__":
    print("Generating ER diagrams...")
    gen(dark=False)
    gen(dark=True)
    print(f"Done — generated light and dark ER diagrams in {OUT_DIR}/")
