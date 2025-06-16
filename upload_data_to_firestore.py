import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import json
import re
import os

# --- Configuration ---
# REPLACE THIS with the actual path to your service account key file
# Make sure this file is in the same directory as your script, or provide the full path.
SERVICE_ACCOUNT_KEY_PATH = "." + os.sep + "serviceAccountKey.json" # Adjusted for current directory

# REPLACE THIS with your actual App ID from the running React application.
# You can see it displayed in the UI of the React app (e.g., "App ID: default-app-id" or a unique string).
# Example: If your app ID is 'my-football-app-123', set it here.
YOUR_APP_ID = '1:140722212660:web:4dbae5a944e96a5c135f61' # <--- IMPORTANT: Update this with your actual app ID!

# Path to the directory containing your CSV files
DATA_DIR = r'D:\New folder\Footballtest\data' # Path for rankings file and player files
DATA_DIR2 = r'D:\New folder\Footballtest\data\teams'
# List of all player CSV files' exact filenames
# ENSURE THESE ARE .csv FILES NOW.
PLAYER_CSV_FILENAMES = [
    "Shadow_Foxes_Players.csv",
    "Bronze_Bears_Players.csv",
    "Crimson_Bulls_Players.csv",
    "Silver_Sharks_Players.csv",
    "Golden_Lions_Players.csv",
    "White_Eagles_Players.csv",
    "Black_Panthers_Players.csv",
    "Green_Wolves_Players.csv",
    "Blue_Tigers_Players.csv",
]

# Exact filename for league rankings
# ENSURE THIS IS A .csv FILE NOW.
RANKINGS_CSV_FILENAME = "Updated_Football_League_Rankings.csv"

# --- Firebase Initialization ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print(f"Please ensure \'{SERVICE_ACCOUNT_KEY_PATH}\' exists and is a valid service account key.")
    exit()

# --- Helper Function to Extract Team Name ---
def extract_team_name(filename):
    # This regex now correctly handles filenames ending in ".csv"
    # It removes ".csv" and then optionally "._Players"
    base_name = re.sub(r'(_Players)?\.csv', '', filename)
    return base_name.replace('_', ' ')


# --- Upload League Rankings ---
print("\n--- Uploading League Rankings ---")
rankings_file_path = os.path.join(DATA_DIR, RANKINGS_CSV_FILENAME)
try:
    if not os.path.exists(rankings_file_path):
        print(f"Error: Rankings file \'{rankings_file_path}\' not found. Skipping rankings upload.")
    else:
        df_rankings = pd.read_csv(rankings_file_path)
        
        # Rename columns to match App.jsx expectations
        df_rankings = df_rankings.rename(columns={
            'Won': 'Wins',
            'Draw': 'Draws',
            'Lost': 'Losses'
        })

        # Add a 'League' column if it doesn't exist
        if 'League' not in df_rankings.columns:
            df_rankings['League'] = 'KSFA Premier League' # Default league name

        rankings_data = df_rankings.to_dict(orient='records')

        rankings_collection_ref = db.collection(f'artifacts/{YOUR_APP_ID}/public/data/leagueRankings')

        for item in rankings_data:
            team_name = item.get('Team')
            if team_name:
                doc_ref = rankings_collection_ref.document(team_name)
                doc_ref.set(item)
                print(f"Uploaded ranking for: {team_name}")
            else:
                print(f"Skipping ranking item due to missing 'Team' field: {item}")
        print("League rankings upload complete.")
except Exception as e:
    print(f"Error uploading league rankings from '{rankings_file_path}': {e}")

# --- Upload Team Players ---
print("\n--- Uploading Team Players ---")
for file_name in PLAYER_CSV_FILENAMES:
    team_name = extract_team_name(file_name)
    file_path = os.path.join(DATA_DIR2, file_name)

    print(f"Processing team: {team_name} from file: {file_path}")
    try:
        if not os.path.exists(file_path):
            print(f"Error: Player file \'{file_path}\' not found. Skipping this team.")
            continue

        df = pd.read_csv(file_path)
        players_list = df.to_dict(orient='records')

        players_json_string = json.dumps(players_list)

        # Changed collection name from 'teams' to 'teamPlayers' to match App.jsx
        team_doc_ref = db.collection(f'artifacts/{YOUR_APP_ID}/public/data/teamPlayers').document(team_name)
        team_doc_ref.set({'players': players_json_string})
        print(f"Uploaded players for: {team_name}")

    except Exception as e:
        print(f"Error processing {file_path} for team {team_name}: {e}")

print("\nAll data upload attempts complete.")

