# -*- coding: utf-8 -*-
"""
Created on Mon Nov  3 14:31:54 2025

@author: svmy
"""

import pandas as pd
import requests

def fetch_csv_from_api() -> pd.DataFrame:
    try:
        url = "http://127.0.0.1:8000/api/resource-data"
        response = requests.get(url, timeout=10)
        response.raise_for_status()  # check for HTTP errors
        
        json_data = response.json()
        
        # Validate structure
        if "data" not in json_data or "columns" not in json_data:
            raise ValueError("Invalid API response format. Expected keys: 'data' and 'columns'")
        
        # Convert to DataFrame
        df = pd.DataFrame(json_data["data"], columns=json_data["columns"])
        return df
    
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Network or connection error: {e}")
    except ValueError as e:
        print(f"⚠️ Data format error: {e}")
    except Exception as e:
        print(f"⚠️ Unexpected error: {e}")

    # Return empty DataFrame on failure
    return pd.DataFrame()

fetch_csv_from_api()