from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pm4py
from pm4py.objects.log.importer.xes import importer as xes_importer
from pm4py.objects.conversion.log import converter as log_converter
from pm4py.algo.discovery.alpha import algorithm as alpha_miner
from pm4py.algo.discovery.inductive import algorithm as inductive_miner
from pm4py.algo.discovery.heuristics import algorithm as heuristics_miner
from pm4py.visualization.petri_net import visualizer as pn_visualizer
from pm4py.algo.conformance.tokenreplay import algorithm as token_replay
from pm4py.algo.evaluation.replay_fitness import algorithm as replay_fitness
from pm4py.algo.evaluation.precision import algorithm as precision_evaluator
from pm4py.algo.evaluation.generalization import algorithm as generalization_evaluator
from pm4py.algo.evaluation.simplicity import algorithm as simplicity_evaluator
from pm4py.statistics.traces.generic.log import case_statistics
from pm4py.statistics.variants.log import get as variants_module
from pm4py.statistics.sojourn_time.log import get as soj_time_get
from pm4py.statistics.attributes.log import get as attr_get
from pm4py.algo.filtering.log.attributes import attributes_filter
from pm4py.algo.filtering.log.variants import variants_filter
from pm4py.algo.filtering.log.timestamp import timestamp_filter
from pm4py.algo.filtering.log.cases import case_filter
from pm4py.algo.filtering.log.start_activities import start_activities_filter
from pm4py.algo.filtering.log.end_activities import end_activities_filter
from pm4py.algo.organizational_mining.roles import algorithm as roles_discovery
from pm4py.algo.organizational_mining.sna import algorithm as sna
from pm4py.algo.enhancement.decision import algorithm as decision_mining
from pm4py.algo.prediction.lstm import algorithm as lstm
import os
import tempfile
import json
import datetime
import numpy as np
import base64
import io
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

app = Flask(__name__)
CORS(app)

# Fonction pour convertir un DataFrame en log d'événements PM4Py
def convert_df_to_eventlog(df):
    # Assurez-vous que les colonnes nécessaires sont présentes
    required_columns = ['case_id', 'activity', 'timestamp']
    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"La colonne {col} est requise pour la conversion en log d'événements")
    
    # Renommer les colonnes pour PM4Py
    df_renamed = df.rename(columns={
        'case_id': 'case:concept:name',
        'activity': 'concept:name',
        'timestamp': 'time:timestamp'
    })
    
    # Convertir les timestamps en datetime si nécessaire
    if not pd.api.types.is_datetime64_any_dtype(df_renamed['time:timestamp']):
        df_renamed['time:timestamp'] = pd.to_datetime(df_renamed['time:timestamp'])
    
    # Convertir en log d'événements
    event_log = log_converter.apply(df_renamed)
    
    return event_log

# Fonction pour convertir les logs BPMN en format compatible avec PM4Py
def convert_bpmn_logs_to_pm4py_format(logs):
    # Créer un DataFrame à partir des logs
    df = pd.DataFrame([
        {
            'case_id': log['processInstanceId'],
            'activity': log['taskName'] if log['taskName'] else log['activityName'],
            'timestamp': log['timestamp'],
            'resource': log['userId'],
            'task_id': log['taskId'],
            'event_type': log['eventType'],
            'process_definition_id': log['processDefinitionId'],
            'duration_ms': log['durationMs']
        }
        for log in logs
    ])
    
    return df

# Fonction pour générer une image à partir d'un graphe Petri net
def get_petri_net_image(petri_net, initial_marking, final_marking):
    gviz = pn_visualizer.apply(petri_net, initial_marking, final_marking)
    
    # Sauvegarder l'image dans un buffer
    with tempfile.NamedTemporaryFile(suffix='.png') as tmp:
        pn_visualizer.save(gviz, tmp.name)
        with open(tmp.name, 'rb') as f:
            image_data = f.read()
    
    # Convertir en base64 pour l'envoi via JSON
    encoded_image = base64.b64encode(image_data).decode('utf-8')
    
    return encoded_image

# Fonction pour générer une image à partir d'un graphique matplotlib
def get_matplotlib_image(fig):
    buf = io.BytesIO()
    FigureCanvas(fig).print_png(buf)
    
    # Convertir en base64 pour l'envoi via JSON
    encoded_image = base64.b64encode(buf.getvalue()).decode('utf-8')
    
    return encoded_image

@app.route('/api/pm4py/process-discovery', methods=['POST'])
def process_discovery():
    try:
        data = request.json
        logs = data.get('logs', [])
        algorithm = data.get('algorithm', 'alpha')
        
        if not logs:
            return jsonify({'error': 'Aucun log fourni'}), 400
        
        # Convertir les logs en format PM4Py
        df = convert_bpmn_logs_to_pm4py_format(logs)
        event_log = convert_df_to_eventlog(df)
        
        # Découvrir le modèle de processus selon l'algorithme choisi
        if algorithm == 'alpha':
            net, initial_marking, final_marking = alpha_miner.apply(event_log)
        elif algorithm == 'inductive':
            net, initial_marking, final_marking = inductive_miner.apply(event_log)
        elif algorithm == 'heuristics':
            net, initial_marking, final_marking = heuristics_miner.apply(event_log)
        else:
            return jsonify({'error': 'Algorithme non supporté'}), 400
        
        # Générer l'image du réseau de Petri
        petri_net_image = get_petri_net_image(net, initial_marking, final_marking)
        
        # Calculer les métriques de qualité du modèle
        replayed_traces = token_replay.apply(event_log, net, initial_marking, final_marking)
        
        fitness = replay_fitness.evaluate(replayed_traces)
        precision = precision_evaluator.apply(event_log, net, initial_marking, final_marking)
        generalization = generalization_evaluator.apply(event_log, net, initial_marking, final_marking)
        simplicity = simplicity_evaluator.apply(net)
        
        return jsonify({
            'petri_net_image': petri_net_image,
            'metrics': {
                'fitness': fitness,
                'precision': precision,
                'generalization': generalization,
                'simplicity': simplicity
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pm4py/process-variants', methods=['POST'])
def process_variants():
    try:
        data = request.json
        logs = data.get('logs', [])
        
        if not logs:
            return jsonify({'error': 'Aucun log fourni'}), 400
        
        # Convertir les logs en format PM4Py
        df = convert_bpmn_logs_to_pm4py_format(logs)
        event_log = convert_df_to_eventlog(df)
        
        # Obtenir les variantes du processus
        variants = variants_module.get_variants(event_log)
        variants_count = variants_module.get_variants_count(event_log)
        
        # Obtenir les statistiques des cas
        all_case_durations = case_statistics.get_all_case_durations(event_log)
        median_case_duration = case_statistics.get_median_case_duration(event_log)
        
        # Créer un graphique des durées des cas
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.hist(all_case_durations, bins=20)
        ax.set_xlabel('Durée (en secondes)')
        ax.set_ylabel('Nombre de cas')
        ax.set_title('Distribution des durées des cas')
        
        case_duration_image = get_matplotlib_image(fig)
        plt.close(fig)
        
        # Préparer les données des variantes pour le frontend
        variants_data = []
        for variant, count in variants_count.items():
            activities = variant.split(',')
            variants_data.append({
                'variant': variant,
                'count': count,
                'percentage': (count / len(event_log)) * 100,
                'activities': activities
            })
        
        # Trier par fréquence décroissante
        variants_data.sort(key=lambda x: x['count'], reverse=True)
        
        return jsonify({
            'variants': variants_data,
            'case_statistics': {
                'total_cases': len(event_log),
                'median_duration': median_case_duration,
                'min_duration': min(all_case_durations) if all_case_durations else 0,
                'max_duration': max(all_case_durations) if all_case_durations else 0,
                'case_duration_image': case_duration_image
            }
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pm4py/bottleneck-analysis', methods=['POST'])
def bottleneck_analysis():
    try:
        data = request.json
        logs = data.get('logs', [])
        
        if not logs:
            return jsonify({'error': 'Aucun log fourni'}), 400
        
        # Convertir les logs en format PM4Py
        df = convert_bpmn_logs_to_pm4py_format(logs)
        event_log = convert_df_to_eventlog(df)
        
        # Calculer les temps de séjour pour chaque activité
        sojourn_times = soj_time_get.apply(event_log)
        
        # Créer un graphique des temps de séjour
        activities = list(sojourn_times.keys())
        times = [sojourn_times[act] for act in activities]
        
        fig, ax = plt.subplots(figsize=(12, 8))
        ax.barh(activities, times)
        ax.set_xlabel('Temps moyen de séjour (en secondes)')
        ax.set_ylabel('Activité')
        ax.set_title('Temps de séjour par activité')
        
        # Trier les activités par temps de séjour décroissant
        sorted_indices = np.argsort(times)[::-1]
        sorted_activities = [activities[i] for i in sorted_indices]
        sorted_times = [times[i] for i in sorted_indices]
        
        fig2, ax2 = plt.subplots(figsize=(12, 8))
        ax2.barh(sorted_activities, sorted_times)
        ax2.set_xlabel('Temps moyen de séjour (en secondes)')
        ax2.set_ylabel('Activité')
        ax2.set_title('Temps de séjour par activité (trié)')
        
        sojourn_image = get_matplotlib_image(fig)
        sorted_sojourn_image = get_matplotlib_image(fig2)
        
        plt.close(fig)
        plt.close(fig2)
        
        # Identifier les goulots d'étranglement (activités avec les temps de séjour les plus longs)
        bottlenecks = []
        for i in range(min(5, len(sorted_activities))):
            bottlenecks.append({
                'activity': sorted_activities[i],
                'sojourn_time': sorted_times[i]
            })
        
        return jsonify({
            'sojourn_times': {act: time for act, time in zip(activities, times)},
            'sojourn_time_image': sojourn_image,
            'sorted_sojourn_image': sorted_sojourn_image,
            'bottlenecks': bottlenecks
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pm4py/performance-prediction', methods=['POST'])
def performance_prediction():
    try:
        data = request.json
        logs = data.get('logs', [])
        case_id = data.get('case_id')
        
        if not logs:
            return jsonify({'error': 'Aucun log fourni'}), 400
        
        if not case_id:
            return jsonify({'error': 'ID de cas non fourni'}), 400
        
        # Convertir les logs en format PM4Py
        df = convert_bpmn_logs_to_pm4py_format(logs)
        event_log = convert_df_to_eventlog(df)
        
        # Filtrer pour obtenir uniquement le cas spécifié
        case_log = case_filter.filter_case_id(event_log, [case_id])
        
        if not case_log:
            return jsonify({'error': 'Cas non trouvé'}), 404
        
        # Obtenir les activités déjà exécutées dans ce cas
        activities = [event['concept:name'] for trace in case_log for event in trace]
        
        # Calculer les temps moyens pour les activités similaires dans d'autres cas
        similar_cases = []
        for trace in event_log:
            trace_activities = [event['concept:name'] for event in trace]
            if all(act in trace_activities for act in activities):
                similar_cases.append(trace)
        
        if not similar_cases:
            return jsonify({'error': 'Aucun cas similaire trouvé pour la prédiction'}), 404
        
        # Calculer la durée moyenne des cas similaires
        similar_case_durations = [case_statistics.get_case_duration(case) for case in similar_cases]
        avg_duration = sum(similar_case_durations) / len(similar_case_durations)
        
        # Calculer la durée actuelle du cas
        current_duration = case_statistics.get_case_duration(case_log[0])
        
        # Prédire la durée restante
        predicted_remaining_duration = avg_duration - current_duration
        
        # Calculer le risque de retard (si la durée prédite est supérieure à la moyenne + écart-type)
        std_duration = np.std(similar_case_durations)
        delay_threshold = avg_duration + std_duration
        delay_risk = (avg_duration + predicted_remaining_duration) > delay_threshold
        
        # Créer un graphique de comparaison
        fig, ax = plt.subplots(figsize=(10, 6))
        ax.bar(['Durée moyenne', 'Durée actuelle', 'Durée prédite'], 
               [avg_duration, current_duration, current_duration + predicted_remaining_duration])
        ax.set_ylabel('Durée (en secondes)')
        ax.set_title('Comparaison des durées')
        
        comparison_image = get_matplotlib_image(fig)
        plt.close(fig)
        
        return jsonify({
            'case_id': case_id,
            'current_duration': current_duration,
            'predicted_remaining_duration': predicted_remaining_duration,
            'predicted_total_duration': current_duration + predicted_remaining_duration,
            'average_duration': avg_duration,
            'delay_risk': delay_risk,
            'comparison_image': comparison_image,
            'similar_cases_count': len(similar_cases)
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/pm4py/social-network-analysis', methods=['POST'])
def social_network_analysis():
    try:
        data = request.json
        logs = data.get('logs', [])
        
        if not logs:
            return jsonify({'error': 'Aucun log fourni'}), 400
        
        # Convertir les logs en format PM4Py
        df = convert_bpmn_logs_to_pm4py_format(logs)
        
        # S'assurer que la colonne resource existe
        if 'resource' not in df.columns or df['resource'].isna().all():
            return jsonify({'error': 'Données de ressources manquantes pour l\'analyse du réseau social'}), 400
        
        event_log = convert_df_to_eventlog(df)
        
        # Découvrir les rôles organisationnels
        roles = roles_discovery.apply(event_log)
        
        # Analyser le réseau social (handover of work)
        hw_values = sna.apply(event_log, variant=sna.Variants.HANDOVER_LOG)
        
        # Créer un graphique du réseau social
        fig, ax = plt.subplots(figsize=(10, 10))
        
        # Convertir la matrice en graphe pour la visualisation
        resources = list(hw_values.keys())
        n = len(resources)
        
        # Créer un graphique simple pour illustrer les relations
        for i in range(n):
            for j in range(n):
                if i != j and hw_values[resources[i]][resources[j]] > 0:
                    ax.plot([i, j], [i, j], 'o-', linewidth=hw_values[resources[i]][resources[j]]*5)
        
        ax.set_xticks(range(n))
        ax.set_yticks(range(n))
        ax.set_xticklabels(resources, rotation=45)
        ax.set_yticklabels(resources)
        ax.set_title('Réseau social (handover of work)')
        
        social_network_image = get_matplotlib_image(fig)
        plt.close(fig)
        
        # Préparer les données des rôles pour le frontend
        roles_data = []
        for role, resources in roles.items():
            roles_data.append({
                'role': role,
                'resources': list(resources),
                'count': len(resources)
            })
        
        # Préparer les données du réseau social pour le frontend
        network_data = []
        for res1 in resources:
            for res2 in resources:
                if res1 != res2 and hw_values[res1][res2] > 0:
                    network_data.append({
                        'source': res1,
                        'target': res2,
                        'value': hw_values[res1][res2]
                    })
        
        return jsonify({
            'roles': roles_data,
            'social_network': network_data,
            'social_network_image': social_network_image
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
