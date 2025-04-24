import os
import json
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging

def get_google_sheets_service():
    try:
        # Load credentials from environment variable
        creds_json = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
        if not creds_json:
            logging.error("Google Sheets credentials not found in environment")
            return None

        credentials_info = json.loads(creds_json)
        credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        service = build('sheets', 'v4', credentials=credentials)
        return service
    except Exception as e:
        logging.error(f"Error setting up Google Sheets service: {e}")
        return None

def append_to_sheet(email):
    try:
        service = get_google_sheets_service()
        if not service:
            return False

        spreadsheet_id = os.environ.get('GOOGLE_SHEET_ID')
        range_name = 'Sheet1!A:B'

        values = [[email, datetime.now().isoformat()]]
        body = {'values': values}

        service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id,
            range=range_name,
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body=body
        ).execute()

        return True
    except Exception as e:
        logging.error(f"Error appending to Google Sheet: {e}")
        return False
