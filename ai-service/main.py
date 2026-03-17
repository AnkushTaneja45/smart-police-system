from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time
import uuid

app = FastAPI(title="Smart Police AI Microservice MVP")

# Allow all origins for MVP testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VoiceDictation(BaseModel):
    audio_base64: str

class NlpQuery(BaseModel):
    natural_language: str
    station_id: int

class SearchQuery(BaseModel):
    query: str
    type: str # 'suspect', 'vehicle', 'phone'

class CdrQuery(BaseModel):
    phone_number: str

class FaceScan(BaseModel):
    image_base64: str

class ChallanDocument(BaseModel):
    fir_id: int
    content_summary: str
    
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "AI & NLP Processing Engine"}

@app.post("/api/ai/speech-to-text")
def speech_to_text(body: VoiceDictation):
    """
    MOCK: Takes an audio file (base64) and simulates Whisper/Bhashini transcription.
    """
    import random
    transcriptions = [
        "A theft occurred at Sector 14 market near the ATM at around 10 PM. A red motorcycle HR-26-XX-1234 was involved.",
        "कल रात सेक्टर 14 मार्केट में चोरी हुई। एक लाल मोटरसाइकिल शामिल थी।",
        "Someone snatched my gold chain near the MG Road metro station. Two people on a black bike fled towards Gurgaon.",
        "मेरी सोने की चैन छीन ली गई MG Road मेट्रो स्टेशन के पास।",
        "I witnessed a hit and run accident on the main highway. A white SUV hit a cyclist and drove away without stopping.",
        "हाइवे पर एक एक्सीडेंट हुआ, एक सफ़ेद गाड़ी ने साइकिल वाले को टक्कर मार दी।"
    ]
    time.sleep(1.5) # Simulate processing
    return {
        "success": True,
        "transcription": random.choice(transcriptions),
        "language_detected": "Multilingual (Hinglish)"
    }

@app.post("/api/ai/extract-entities")
def extract_entities(text: str):
    """
    MOCK: Analyzes raw text using IndicBERT NLP to auto-fill FIR fields.
    Now with simple dynamic mock logic!
    """
    time.sleep(1) # Simulate NLP inference
    
    entities = {
        "INCIDENT_TYPE": "General Incident",
        "LOCATION": "Unknown",
        "TIME": "Unknown",
        "VEHICLES": [],
        "SUSPECTS": []
    }
    suggested_bns_sections = []
    
    text_lower = text.lower()
    
    # Very simple mock entity extraction rules
    if "theft" in text_lower or "stolen" in text_lower:
        entities["INCIDENT_TYPE"] = "Theft"
        suggested_bns_sections.append("BNS 303(2) (Theft)")
    elif "accident" in text_lower or "collided" in text_lower:
        entities["INCIDENT_TYPE"] = "Traffic Accident"
        suggested_bns_sections.append("BNS 281 (Rash Driving)")
    elif "assault" in text_lower or "hit" in text_lower or "beat" in text_lower:
        entities["INCIDENT_TYPE"] = "Assault"
        suggested_bns_sections.append("BNS 115 (Voluntarily causing hurt)")
        
    if "sector 14" in text_lower:
         entities["LOCATION"] = "Sector 14"
    elif "mg road" in text_lower:
         entities["LOCATION"] = "MG Road"
         
    if "hr-26" in text_lower or "hr 26" in text_lower:
         # Mocking vehicle extraction
         words = text_lower.split()
         for i, word in enumerate(words):
             if "hr" in word:
                 entities["VEHICLES"].append(word.upper())
                 
    if "ramesh" in text_lower:
         entities["SUSPECTS"].append("Ramesh")

    return {
        "success": True,
        "entities": entities,
        "suggested_bns_sections": suggested_bns_sections,
        "original_text": text
    }

@app.post("/api/ai/text-to-sql")
def text_to_sql(query: NlpQuery):
    """
    MOCK: Analyzes natural language query from SP dashboard and outputs safe parameterized SQL.
    """
    time.sleep(1.2)
    nlp_text = query.natural_language.lower()
    
    # Simple heuristic mock logic
    if "heinous" in nlp_text or "murder" in nlp_text:
        sql = "SELECT FIRID, SectionsApplied, Status, AssignedIO FROM FIRs WHERE Status = 'Under Investigation' AND (SectionsApplied LIKE '%302%' OR SectionsApplied LIKE '%304%');"
        intent = "find_heinous_active_cases"
    elif "theft" in nlp_text:
        sql = "SELECT * FROM Complaints WHERE Description LIKE '%theft%' AND Status = 'Pending';"
        intent = "find_pending_theft_complaints"
    else:
        sql = "SELECT COUNT(*) as IncidentCount, DATE(CreatedAt) as Date FROM FIRs GROUP BY DATE(CreatedAt);"
        intent = "general_trend_analysis"
        
    return {
        "success": True,
        "generated_sql": sql,
        "identified_intent": intent,
        "confidence_score": 0.94
    }

@app.post("/api/ai/fuzzy-search")
def fuzzy_search(query: SearchQuery):
    """
    MOCK: Simulates Elasticsearch fuzzy searching and Neo4j graph traversal
    to find linked cases.
    """
    time.sleep(1) # Simulate complex graph traversal
    
    q_lower = query.query.lower()
    
    # Mocking graph data
    if "ramesh" in q_lower or query.type == 'suspect':
        return {
            "success": True,
            "entity": {
                "name": "Ramesh Kumar (Alias Raka)",
                "type": "Suspect",
                "risk_score": 85
            },
            "linked_cases": [
                {"fir_id": 102, "station": "Sector 14", "role": "Primary Accused", "status": "Absconding"},
                {"fir_id": 89, "station": "City PS", "role": "Accomplice", "status": "Closed"}
            ],
            "linked_nodes": ["HR-26-XX-1234 (Vehicle)", "9988776655 (Phone)"]
        }
    elif "hr-26-xx" in q_lower or query.type == 'vehicle':
        return {
             "success": True,
             "entity": {
                 "name": "HR-26-XX-1234",
                 "type": "Red Motorcycle",
                 "risk_score": 92
             },
             "linked_cases": [
                 {"fir_id": 102, "station": "Sector 14", "role": "Getaway Vehicle", "status": "Impounded"}
             ],
             "linked_nodes": ["Ramesh Kumar (Suspect)", "Amit Singh (Owner)"]
        }
        
    return {
        "success": True,
        "entity": None,
        "linked_cases": [],
        "message": "No significant graph linkages found."
    }

@app.post("/api/ai/analyze-cdr")
def analyze_cdr(query: CdrQuery):
    """
    MOCK: Simulates parsing thousands of call records to find the
    most frequent contacts and build a local graph cluster.
    """
    time.sleep(1.5) # Simulate heavy IPDR/CDR processing
    
    number = query.phone_number
    
    return {
        "success": True,
        "target_number": number,
        "total_calls_analyzed": 4820,
        "top_contacts": [
            {"number": "+91-9988776655", "calls": 145, "risk": "High - Known Associate (Ramesh)"},
            {"number": "+91-8877665544", "calls": 89, "risk": "Medium - Unverified"},
            {"number": "+91-7766554433", "calls": 42, "risk": "Low"}
        ],
        "pattern_detected": "High frequency of calls between 1 AM and 4 AM to High Risk node."
    }

@app.post("/api/ai/face-scan")
def face_scan(scan: FaceScan):
    """
    MOCK: Simulates Facial Recognition System (FRS) matching against
    CCTNS database via vector embeddings.
    """
    time.sleep(2) # Simulate image processing and vector search
    
    # In a real app we'd decode the base64 image and run inference.
    # For MVP, we'll just mock a positive hit.
    return {
         "success": True,
         "match_found": True,
         "confidence_score": 98.4,
         "matched_profile": {
             "name": "Ramesh Kumar",
             "cctns_id": "HR-CCTNS-2021-9844",
             "status": "Wanted (Sector 14)",
             "known_aliases": ["Raka"],
             "last_known_location": "Rohtak"
         }
    }

@app.post("/api/ai/challan-scrutiny")
def challan_scrutiny(doc: ChallanDocument):
    """
    MOCK: Simulates AI reading the final chargesheet packet before court submission
    to ensure all procedural compliances are met, minimizing court rejections.
    """
    time.sleep(2.5) # Simulate document OCR and compliance rule-engine check
    
    content = doc.content_summary.lower()
    defects = []
    
    if "ndps" in content and "gazetted" not in content and "section 50" not in content:
        defects.append("CRITICAL: Section 50 NDPS compliance not found (Search before Gazetted Officer/Magistrate document missing).")
        
    if "injury" in content and "mlc" not in content and "medical" not in content:
        defects.append("WARNING: Medico-Legal Request Form (MLC) is missing for an assault case.")
        
    if "seizure" in content and "fsl" not in content:
        defects.append("WARNING: FSL Dispatch receipt for seized items is missing.")

    if len(defects) > 0:
        return {
            "success": True,
            "status": "REJECTED",
            "score": 45,
            "defects": defects,
            "message": "AI found procedural defects. Fix before Judiciary submission."
        }
    else:
        return {
            "success": True,
            "status": "APPROVED",
            "score": 98,
            "defects": [],
            "message": "All compliance checks passed."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
