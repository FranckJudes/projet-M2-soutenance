FROM python:3.9-slim

WORKDIR /app

# Installer les dépendances système nécessaires pour PM4Py et matplotlib
RUN apt-get update && apt-get install -y \
    graphviz \
    graphviz-dev \
    pkg-config \
    build-essential \
    python3-tk \
    && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Exposer le port sur lequel l'application Flask s'exécute
EXPOSE 5000

# Commande pour démarrer l'application
CMD ["python", "app.py"]
