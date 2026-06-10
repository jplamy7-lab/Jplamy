FROM python:3.11-slim

# Configuration de base pour l'environnement (192.168.1.115)
WORKDIR /app

# Installation des dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie des fichiers sources (Script Python et Prompt Système)
COPY system_prompt.txt .
COPY agent_system.py .

# Variables d'environnement par défaut
ENV SERVER_IP=192.168.1.115
ENV LLM_ENDPOINT=http://ollama:11434/api/generate

CMD ["python", "agent_system.py"]
