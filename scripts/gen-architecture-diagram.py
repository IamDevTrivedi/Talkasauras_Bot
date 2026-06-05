#!/usr/bin/env python3
"""Generate Talkasauras Bot architecture diagram (light + dark)."""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.general import User, Client
from diagrams.saas.chat import Telegram
from diagrams.onprem.inmemory import Redis
from diagrams.aws.database import RDSPostgresqlInstance
from diagrams.programming.language import NodeJS
from diagrams.aws.robotics import Robomaker   
from diagrams.aws.ml import Bedrock            

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "docs",
    "diagrams",
)
os.makedirs(OUT_DIR, exist_ok=True)

DIAGRAM_NAME = "talkasauras-architecture"

def gen(dark: bool):
    suffix = "-dark" if dark else ""
    bg = "#0f0f13" if dark else "white"
    fc = "#e8e8ea" if dark else "#1e1e1e"
    edge_color = "#65656e" if dark else "#495057"

    if dark:
        cc = {
            "purple": {"bg": "#1a1a2a", "fc": "#c4b5fd", "border": "#6741d9"},
            "green":  {"bg": "#1a2a1a", "fc": "#86efac", "border": "#2f9e44"},
            "yellow": {"bg": "#2a2a1a", "fc": "#fde68a", "border": "#e67700"},
            "blue":   {"bg": "#1a1a2a", "fc": "#93c5fd", "border": "#1971c2"},
            "cyan":   {"bg": "#1a2a2a", "fc": "#67e8f9", "border": "#0c8599"},
        }
    else:
        cc = {
            "purple": {"bg": "#d0bfff40", "fc": "#6741d9", "border": "#6741d9"},
            "green":  {"bg": "#b2f2bb40", "fc": "#2f9e44", "border": "#2f9e44"},
            "yellow": {"bg": "#ffec9940", "fc": "#e67700", "border": "#e67700"},
            "blue":   {"bg": "#a5d8ff40", "fc": "#1971c2", "border": "#1971c2"},
            "cyan":   {"bg": "#99e9f240", "fc": "#0c8599", "border": "#0c8599"},
        }

    graph_attr = {
        "bgcolor": bg,
        "fontcolor": fc,
        "fontsize": "18",
        "fontname": "Helvetica Bold",
        "pad": "0.5",
        "nodesep": "0.55",   
        "ranksep": "1.3",    
        "dpi": "150",
        "label": "Talkasauras Bot Architecture\n\n",
        "labelloc": "t",
        "rankdir": "TB",     
        "compound": "true",
        "splines": "ortho",  
    }

    node_attr = {
        "fontsize": "12",
        "fontname": "Helvetica",
        "fontcolor": fc,
        "height": "1.1",
    }

    edge_attr = {
        "color": edge_color,
        "penwidth": "1.8",
    }

    def cattr(key):
        c = cc[key]
        return {
            "fontsize": "14",
            "fontname": "Helvetica Bold",
            "penwidth": "1.5",
            "labeljust": "c",
            "labelloc": "t",
            "style": "dashed,rounded",
            "margin": "16",
            "bgcolor": c["bg"],
            "fontcolor": c["fc"],
            "pencolor": c["border"],
        }

    out_path = os.path.join(OUT_DIR, f"{DIAGRAM_NAME}{suffix}")

    with Diagram(
        "",
        filename=out_path,
        show=False,
        direction="TB",
        graph_attr=graph_attr,
        node_attr=node_attr,
        edge_attr=edge_attr,
        outformat="png",
    ):
        e = Edge(color=edge_color)

        with Cluster("Users", graph_attr=cattr("green")):
            user = User("User")
            admin = Client("Admin")

        with Cluster("Telegram", graph_attr=cattr("blue")):
            tg = Telegram("Telegram")

        with Cluster("Application Layer", graph_attr=cattr("purple")):
            main_bot = Robomaker("Telegraf\nMain Bot")   
            admin_bot = Robomaker("Telegraf\nAdmin Bot") 
            api = NodeJS("Express API")

        with Cluster("AI / LLM", graph_attr=cattr("cyan")):
            ollama = Bedrock("Ollama LLM")               

        with Cluster("Data Layer", graph_attr=cattr("yellow")):
            redis = Redis("Redis")
            db = RDSPostgresqlInstance("PostgreSQL")

        [user, admin] >> e >> tg

        tg >> e >> main_bot
        tg >> e >> admin_bot

        main_bot >> e >> ollama

        main_bot >> e >> redis
        main_bot >> e >> db
        admin_bot >> e >> db

gen(dark=False)
gen(dark=True)
print(f"Done — generated light and dark diagrams in {OUT_DIR}/")