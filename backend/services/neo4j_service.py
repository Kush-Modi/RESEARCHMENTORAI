import os
from typing import List, Dict, Any
from neo4j import GraphDatabase
from sqlalchemy.orm import Session
from models.paper import Paper
from services.openalex_service import fetch_works_batch

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

_driver = None

def get_driver():
    global _driver
    if _driver is None:
        if not NEO4J_URI or not NEO4J_USERNAME or not NEO4J_PASSWORD:
            print("Warning: Neo4j credentials missing from environment.")
            return None
        try:
            _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
            # Create constraints on startup
            initialize_constraints()
        except Exception as e:
            print(f"Error creating Neo4j driver: {e}")
            _driver = None
    return _driver

def initialize_constraints():
    """
    Enforces uniqueness constraints in Neo4j to speed up MERGE operations and avoid duplicates.
    """
    if _driver is None:
        return
    
    constraints_queries = [
        "CREATE CONSTRAINT FOR (p:Paper) REQUIRE p.openalex_id IS UNIQUE",
        "CREATE CONSTRAINT FOR (a:Author) REQUIRE a.name IS UNIQUE",
        "CREATE CONSTRAINT FOR (c:Concept) REQUIRE c.name IS UNIQUE"
    ]
    
    with _driver.session() as session:
        for query in constraints_queries:
            try:
                session.run(query)
            except Exception as e:
                # Constraints might already exist or system database doesn't support IF NOT EXISTS
                pass

def close_driver():
    global _driver
    if _driver is not None:
        try:
            _driver.close()
            print("Neo4j driver connection closed.")
        except Exception as e:
            print(f"Error closing Neo4j driver: {e}")
        _driver = None

async def build_graph_from_postgres(db: Session) -> int:
    """
    Reads all papers from PostgreSQL, fetches detailed metadata (references, authors, concepts)
    from OpenAlex in batch, and populates the Neo4j database.
    """
    driver = get_driver()
    if not driver:
        raise ValueError("Neo4j connection driver not initialized.")

    # 1. Fetch all PostgreSQL papers
    papers = db.query(Paper).all()
    if not papers:
        return 0

    openalex_ids = [p.openalex_id for p in papers]

    # 2. Fetch detailed metadata in batches of 20
    works_map = await fetch_works_batch(openalex_ids)

    papers_synchronized = 0

    with driver.session() as session:
        for paper in papers:
            work_details = works_map.get(paper.openalex_id)
            if not work_details:
                # If batch fetch failed for this specific work, retrieve single work details
                from services.openalex_service import fetch_work_details
                work_details = await fetch_work_details(paper.openalex_id)
                if not work_details:
                    continue

            # Parse metadata
            authorships = work_details.get("authorships", [])
            authors = []
            for a in authorships:
                author_info = a.get("author")
                if author_info and author_info.get("display_name"):
                    authors.append(author_info.get("display_name"))

            concepts = []
            for c in work_details.get("concepts", []):
                if c.get("display_name"):
                    concepts.append(c.get("display_name"))
            for t in work_details.get("topics", []):
                if t.get("display_name"):
                    concepts.append(t.get("display_name"))

            referenced_works = work_details.get("referenced_works", [])

            # Write to Neo4j in a single transaction block per paper
            def sync_tx(tx):
                # A. Merge main paper node
                tx.run(
                    """
                    MERGE (p:Paper {openalex_id: $openalex_id})
                    SET p.paper_id = $paper_id,
                        p.title = $title,
                        p.year = $year,
                        p.citation_count = $citation_count
                    """,
                    openalex_id=paper.openalex_id,
                    paper_id=paper.id,
                    title=paper.title,
                    year=paper.publication_year,
                    citation_count=paper.citation_count
                )

                # B. Merge Author nodes and AUTHORED relationships
                for author_name in authors:
                    tx.run(
                        """
                        MERGE (a:Author {name: $name})
                        WITH a
                        MATCH (p:Paper {openalex_id: $openalex_id})
                        MERGE (a)-[:AUTHORED]->(p)
                        """,
                        name=author_name,
                        openalex_id=paper.openalex_id
                    )

                # C. Merge Concept nodes and HAS_CONCEPT relationships
                for concept_name in concepts:
                    tx.run(
                        """
                        MERGE (c:Concept {name: $name})
                        WITH c
                        MATCH (p:Paper {openalex_id: $openalex_id})
                        MERGE (p)-[:HAS_CONCEPT]->(c)
                        """,
                        name=concept_name,
                        openalex_id=paper.openalex_id
                    )

                # D. Merge cited Paper nodes and CITES relationships
                for ref_openalex_id in referenced_works:
                    tx.run(
                        """
                        MERGE (ref:Paper {openalex_id: $ref_id})
                        WITH ref
                        MATCH (p:Paper {openalex_id: $openalex_id})
                        MERGE (p)-[:CITES]->(ref)
                        """,
                        ref_id=ref_openalex_id,
                        openalex_id=paper.openalex_id
                    )

            session.execute_write(sync_tx)
            papers_synchronized += 1

    return papers_synchronized

def get_paper_graph(paper_id: int) -> Dict[str, List[Dict[str, Any]]]:
    """
    Retrieves the 1-hop subgraph around the given paper ID.
    Returns lists of nodes and edges ready for visualization.
    """
    driver = get_driver()
    if not driver:
        return {"nodes": [], "edges": []}

    nodes = []
    edges = []
    seen_nodes = set()
    seen_edges = set()

    # Cypher query to retrieve paper and all neighbor nodes and connections
    query = """
    MATCH (p:Paper {paper_id: $paper_id})
    OPTIONAL MATCH (p)-[r]-(n)
    RETURN p, r, n
    """

    with driver.session() as session:
        result = session.run(query, paper_id=paper_id)
        records = list(result)
        
        if not records:
            return {"nodes": [], "edges": []}

        # First add target paper
        target_paper = records[0]["p"]
        target_node_id = f"paper_{target_paper['paper_id']}"
        seen_nodes.add(target_node_id)
        nodes.append({
            "id": target_node_id,
            "label": target_paper["title"],
            "type": "Paper",
            "isTarget": True,
            "properties": {
                "paper_id": target_paper["paper_id"],
                "openalex_id": target_paper["openalex_id"],
                "title": target_paper["title"],
                "year": target_paper.get("year"),
                "citation_count": target_paper.get("citation_count")
            }
        })

        for record in records:
            n = record["n"]
            r = record["r"]
            if n is None or r is None:
                continue

            labels = list(n.labels)
            n_type = labels[0] if labels else "Unknown"

            # Determine unique ID for neighbor node
            if n_type == "Paper":
                if n.get("paper_id"):
                    n_id = f"paper_{n['paper_id']}"
                    label = n.get("title", "Untitled Paper")
                else:
                    n_id = f"paper_ext_{n['openalex_id'].split('/')[-1]}"
                    label = f"Cited Work: {n['openalex_id'].split('/')[-1]}"
            elif n_type == "Author":
                n_id = f"author_{n['name']}"
                label = n["name"]
            elif n_type == "Concept":
                n_id = f"concept_{n['name']}"
                label = n["name"]
            else:
                n_id = f"node_{n.element_id}"
                label = str(n)

            if n_id not in seen_nodes:
                seen_nodes.add(n_id)
                nodes.append({
                    "id": n_id,
                    "label": label,
                    "type": n_type,
                    "isTarget": False,
                    "properties": dict(n)
                })

            # Format edge connection mapping
            start_node = r.nodes[0]
            end_node = r.nodes[1]

            def get_mapped_id(node):
                l = list(node.labels)
                t = l[0] if l else "Unknown"
                if t == "Paper":
                    if node.get("paper_id"):
                        return f"paper_{node['paper_id']}"
                    return f"paper_ext_{node['openalex_id'].split('/')[-1]}"
                elif t == "Author":
                    return f"author_{node['name']}"
                elif t == "Concept":
                    return f"concept_{node['name']}"
                return f"node_{node.element_id}"

            edge_from = get_mapped_id(start_node)
            edge_to = get_mapped_id(end_node)
            edge_key = (edge_from, edge_to, r.type)

            if edge_key not in seen_edges:
                seen_edges.add(edge_key)
                edges.append({
                    "from": edge_from,
                    "to": edge_to,
                    "label": r.type
                })

    return {"nodes": nodes, "edges": edges}
