import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os
import re
import asyncio

# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = "." + os.sep + "serviceAccountKey.json"
YOUR_APP_ID = '1:140722212660:web:4dbae5a944e96a5c135f61'
BASE_DATA_DIR = r'D:\New folder\Footballtest\data'

STATES = ['karnataka', 'kerala', 'delhi']
DIVISIONS = ['U15', 'U17', 'U21', 'B_Division', 'A_Division', 'Super_Division']

# --- Firebase Initialization ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    exit()

def extract_team_name(filename):
    return re.sub(r'(_Players)?\.csv', '', filename).replace('_', ' ')

# --- Upload League Rankings ---
async def upload_rankings_data():
    print("\n--- Uploading League Rankings ---")
    
    for state in STATES:
        for division in DIVISIONS:
            league_file = f"{division}_League_Rankings.csv"
            rankings_file_path = os.path.join(BASE_DATA_DIR, f"{state}_football_data", league_file)

            if not os.path.exists(rankings_file_path):
                print(f"Missing: {rankings_file_path}")
                continue

            try:
                df = pd.read_csv(rankings_file_path)
                collection_path = f"artifacts/{YOUR_APP_ID}/public/data/{state}/{division}/Rankings"
                for _, row in df.iterrows():
                    team_name = row['Team']
                    doc_ref = db.collection(collection_path).document(team_name)
                    row_dict = row.to_dict()
                    row_dict['division'] = division
                    doc_ref.set(row_dict)
                    print(f"Uploaded {team_name} to {collection_path}")
            except Exception as e:
                print(f"Error uploading {rankings_file_path}: {e}")

# --- Upload Team Players ---
async def upload_team_players():
    print("\n--- Uploading Team Players ---")

    for state in STATES:
        for division in DIVISIONS:
            team_dir = os.path.join(BASE_DATA_DIR, f"{state}_football_data", 'teams', division)
            if not os.path.exists(team_dir):
                print(f"Missing: {team_dir}")
                continue

            for file_name in os.listdir(team_dir):
                if not file_name.endswith('.csv'):
                    continue
                team_name = extract_team_name(file_name)
                file_path = os.path.join(team_dir, file_name)
                try:
                    df = pd.read_csv(file_path)
                    players_list = df.to_dict(orient='records')
                    collection_path = f'artifacts/{YOUR_APP_ID}/public/data/{state}/{division}/Teams'
                    doc_ref = db.collection(collection_path).document(team_name)
                    doc_ref.set({
                        'players': players_list,
                        'state': state,
                        'division': division
                    })
                    print(f"Uploaded {team_name} to {collection_path}")
                except Exception as e:
                    print(f"Error uploading {file_path}: {e}")

# --- Delete Existing Data ---
async def delete_all_collections():
    print("\n--- Deleting Existing Data ---")
    for state in STATES:
        for division in DIVISIONS:
            try:
                rank_path = f"artifacts/{YOUR_APP_ID}/public/data/{state}/{division}/Rankings"
                team_path = f"artifacts/{YOUR_APP_ID}/public/data/{state}/{division}/Teams"
                for path in [rank_path, team_path]:
                    docs = db.collection(path).get()
                    for doc in docs:
                        doc.reference.delete()
                    print(f"Deleted: {path}")
            except Exception as e:
                print(f"Error deleting data for {state}-{division}: {e}")

# --- Main ---
async def main():
    await delete_all_collections()
    await upload_rankings_data()
    await upload_team_players()
    print("\nData upload complete.")

if __name__ == "__main__":
    asyncio.run(main())
