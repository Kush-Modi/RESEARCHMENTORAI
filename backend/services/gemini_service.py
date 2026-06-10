import os
import json
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def _get_model():
    # Returns the gemini-2.5-flash model instance
    return genai.GenerativeModel("gemini-2.5-flash")

def generate_roadmap_ai(topic: str) -> dict:
    """
    Generates a 4-stage progressive learning roadmap for a given research topic
    using gemini-2.5-flash with forced JSON output configuration.
    """
    model = _get_model()
    
    prompt = f"""
    You are an expert AI Research Mentor and Learning Roadmap Architect.
    Create a detailed, progressive research learning roadmap for the topic: "{topic}".
    
    You MUST return a JSON object containing exactly four keys: "Beginner", "Intermediate", "Advanced", and "Research Frontier".
    
    Each of these keys must map to an object containing exactly these fields:
    - "concepts": a list of specific concept names or terms to learn (3-5 items, e.g. ["Retrieval-Augmented Generation", "Tool Calling"])
    - "learning_objectives": a list of clear learning objectives (3-4 items)
    - "recommended_progression": a concise description (1-2 sentences) of how to study these concepts progressively.
    
    Make sure the concepts are specific and relevant, suitable for querying in a research paper search.
    Return ONLY valid, well-formed JSON matching this schema. Do not include markdown code block formatting.
    """

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        data = json.loads(response.text)
        # Verify all four stages are present
        for stage in ["Beginner", "Intermediate", "Advanced", "Research Frontier"]:
            if stage not in data:
                # Add default fallback empty structure if missing
                data[stage] = {
                    "concepts": [topic],
                    "learning_objectives": [f"Learn fundamentals of {topic}"],
                    "recommended_progression": "Study base materials first."
                }
        return data
    except Exception as e:
        print(f"Error parsing Gemini roadmap output: {e}. Raw text: {response.text}")
        raise ValueError("AI generated roadmap returned invalid JSON structure.")

def generate_concept_explanation_ai(concept: str) -> dict:
    """
    Generates a structured research mentor explanation for a concept using gemini-2.5-flash.
    """
    model = _get_model()
    
    prompt = f"""
    You are an expert AI Research Mentor.
    Provide a clear, detailed, and highly educational explanation for the concept: "{concept}".
    
    You MUST return a JSON object containing exactly these fields:
    - "simple_explanation": a clear, easy-to-understand summary of the concept.
    - "key_ideas": a list of 3-5 core ideas or components that define the concept.
    - "common_mistakes": a list of 2-4 common mistakes, pitfalls, or misconceptions when studying or implementing this.
    - "related_concepts": a list of 3-4 related concepts to study next.
    
    Return ONLY valid, well-formed JSON matching this schema. Do not include markdown code block formatting.
    """

    response = model.generate_content(
        prompt,
        generation_config={"response_mime_type": "application/json"}
    )
    
    try:
        return json.loads(response.text)
    except Exception as e:
        print(f"Error parsing Gemini explanation output: {e}. Raw text: {response.text}")
        raise ValueError("AI generated explanation returned invalid JSON structure.")
