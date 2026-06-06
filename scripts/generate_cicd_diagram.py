#!/usr/bin/env python3
"""Generate Talkasauras CI/CD pipeline diagram (light + dark)."""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.vcs import Github
from diagrams.onprem.ci import GithubActions
from diagrams.programming.language import NodeJS
from diagrams.onprem.container import Docker
from diagrams.onprem.registry import Harbor
from diagrams.aws.compute import EC2, EC2Ami
from diagrams.aws.database import RDSPostgresqlInstance
from diagrams.aws.management import Cloudwatch

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "docs",
    "diagrams",
)
os.makedirs(OUT_DIR, exist_ok=True)

DIAGRAM_NAME = "talkasauras-cicd"


def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg         = "#0f0f13" if dark else "white"
    fc         = "#e8e8ea" if dark else "#1e1e1e"
    edge_color = "#65656e" if dark else "#495057"
    fail_color = "#f03e3e" if dark else "#c92a2a"   # dashed red for rollback path

    if dark:
        cc = {
            "green":  {"bg": "#1a2a1a", "fc": "#86efac", "border": "#2f9e44"},
            "cyan":   {"bg": "#1a2a2a", "fc": "#67e8f9", "border": "#0c8599"},
            "blue":   {"bg": "#1a1a2a", "fc": "#93c5fd", "border": "#1971c2"},
            "purple": {"bg": "#221a2a", "fc": "#c4b5fd", "border": "#6741d9"},
            "yellow": {"bg": "#2a2a1a", "fc": "#fde68a", "border": "#e67700"},
        }
    else:
        cc = {
            "green":  {"bg": "#b2f2bb40", "fc": "#2f9e44", "border": "#2f9e44"},
            "cyan":   {"bg": "#99e9f240", "fc": "#0c8599", "border": "#0c8599"},
            "blue":   {"bg": "#a5d8ff40", "fc": "#1971c2", "border": "#1971c2"},
            "purple": {"bg": "#d0bfff40", "fc": "#6741d9", "border": "#6741d9"},
            "yellow": {"bg": "#ffec9940", "fc": "#e67700", "border": "#e67700"},
        }

    graph_attr = {
        "bgcolor":    bg,
        "fontcolor":  fc,
        "fontsize":   "18",
        "fontname":   "Helvetica Bold",
        "pad":        "0.5",
        "nodesep":    "0.55",
        "ranksep":    "1.3",
        "dpi":        "150",
        "label":      "Talkasauras CI/CD Pipeline\n\n",
        "labelloc":   "t",
        "rankdir":    "LR",
        "compound":   "true",
        "splines":    "ortho",
    }

    node_attr = {
        "fontsize":  "12",
        "fontname":  "Helvetica",
        "fontcolor": fc,
        "height":    "1.1",
    }

    edge_attr = {
        "color":    edge_color,
        "penwidth": "1.8",
    }

    def cattr(key):
        c = cc[key]
        return {
            "fontsize":  "14",
            "fontname":  "Helvetica Bold",
            "penwidth":  "1.5",
            "labeljust": "c",
            "labelloc":  "t",
            "style":     "dashed,rounded",
            "margin":    "16",
            "bgcolor":   c["bg"],
            "fontcolor": c["fc"],
            "pencolor":  c["border"],
        }

    out_path = os.path.join(OUT_DIR, f"{DIAGRAM_NAME}{suffix}")

    with Diagram(
        "",
        filename=out_path,
        show=False,
        direction="LR",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
        outformat="png",
    ):
        e      = Edge(color=edge_color, penwidth="1.8")
        e_fail = Edge(color=fail_color, penwidth="1.8", style="dashed")

        # ── Trigger ───────────────────────────────────────────────────
        with Cluster("Trigger", graph_attr=cattr("green")):
            push = Github("Push to main\n(ignore docs/*)")

        # ── Gate ──────────────────────────────────────────────────────
        with Cluster("Gate", graph_attr=cattr("cyan")):
            gate = GithubActions("Gate\n(SKIP_ACTIONS?)")

        # ── Quality Checks (parallel) ─────────────────────────────────
        with Cluster("Quality Checks", graph_attr=cattr("blue")):
            lint     = NodeJS("Lint\n(ESLint)")
            prettier = NodeJS("Prettier\nCheck")

        # ── Build & Push ──────────────────────────────────────────────
        with Cluster("Build & Push", graph_attr=cattr("purple")):
            build = Docker("Build Image")
            ghcr  = Github("GHCR Push")

        # ── Deploy ────────────────────────────────────────────────────
        with Cluster("Deploy to EC2", graph_attr=cattr("yellow")):
            ec2        = EC2("EC2 Instance\n(SSH)")
            compose    = Docker("Compose\nPull & Up")
            db_migrate = RDSPostgresqlInstance("DB Migrate\n(Prisma)")
            health     = Cloudwatch("Health Check\n/api/v1/health")
            rollback   = EC2Ami("Rollback\nCandidate")

        # ── Edges ─────────────────────────────────────────────────────
        push >> e >> gate

        gate >> e >> lint
        gate >> e >> prettier

        [lint, prettier] >> e >> build
        build >> e >> ghcr

        ghcr >> e >> ec2
        ec2 >> e >> compose
        compose >> e >> db_migrate
        db_migrate >> e >> health

        # dashed red = failure path
        health >> e_fail >> rollback


gen(dark=False)
gen(dark=True)
print(f"Done — generated light and dark CI/CD diagrams in {OUT_DIR}/")
