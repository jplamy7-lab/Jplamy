import os
import json
import requests
import time

class PrivateAgentSwarm:
    def __init__(self, llm_endpoint="http://ollama:11434/api/generate", model="mistral"):
        self.llm_endpoint = llm_endpoint
        self.model = model
        self.system_prompt = self.load_system_prompt()
        self.server_ip = os.environ.get("SERVER_IP", "192.168.1.115")

    def load_system_prompt(self):
        try:
            with open("system_prompt.txt", "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return "Tu es l'ORCHESTRATEUR..." # Fallback minimum

    def query_llm(self, prompt):
        payload = {
            "model": self.model,
            "prompt": f"{self.system_prompt}\n\nRequête Utilisateur : {prompt}",
            "stream": False
        }
        try:
            response = requests.post(self.llm_endpoint, json=payload, timeout=120)
            response.raise_for_status()
            return response.json().get("response", "Erreur: Pas de réponse générée.")
        except requests.exceptions.RequestException as e:
            return f'["ERREUR CRITIQUE", "Le serveur local LLM est injoignable: {str(e)}"]'

    def process_request(self, text):
        print(f"[{time.strftime('%H:%M:%S')}] [192.168.1.115] Traitement via Orchestrateur...")
        result = self.query_llm(text)
        return {"status": "success", "data": result}

if __name__ == "__main__":
    print("="*60)
    print(f"[*] Initialisation du Swarm Privé sur le serveur 192.168.1.115")
    print("="*60)
    
    swarm = PrivateAgentSwarm()
    
    # Simulation d'une requête entrante
    query = "Analyse le potentiel de la parcelle. Vérifie les coûts d'entretien (asphalte et gazon) et rédige un slogan pour sa mise en marché."
    print(f"\n[->] Entrée : {query}\n")
    
    res = swarm.process_request(query)
    
    print("\n[<-] Sortie Pipeline :")
    print(res["data"])
    print("="*60)
