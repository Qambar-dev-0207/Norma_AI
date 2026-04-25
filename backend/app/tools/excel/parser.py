import pandas as pd
import google.generativeai as genai
from app.config import get_settings
import json
from typing import List, Dict, Any

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

async def parse_excel_with_ai(file_path: str) -> Dict[str, Any]:
    # Read the Excel file
    df = pd.read_excel(file_path)
    columns = df.columns.tolist()
    
    # Get first few rows as sample
    sample_data = df.head(3).to_dict(orient='records')
    
    # Use Gemini to map columns to our schema
    prompt = f"""
    Analyze the following Excel columns and sample data from a patient list.
    Map these columns to our clinical schema: 
    - full_name (required)
    - phone_number (required)
    - email
    - gender
    - date_of_birth
    - address
    - medical_alerts (allergies, etc.)
    - notes
    - insurance_provider
    - insurance_id

    Excel Columns: {columns}
    Sample Data: {json.dumps(sample_data)}
...
    """
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(prompt)
    
    try:
        # Extract JSON from response
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        mapping = json.loads(text)
    except Exception as e:
        print(f"AI Mapping Error: {e}")
        # Fallback: simple mapping
        mapping = {
            "full_name": columns[0] if len(columns) > 0 else None,
            "phone": columns[1] if len(columns) > 1 else None
        }

    # Process rows
    processed_data = []
    errors = []
    
    for index, row in df.iterrows():
        try:
            record = {}
            for schema_field, excel_col in mapping.items():
                if excel_col and excel_col in df.columns:
                    val = row[excel_col]
                    # Handle NaN
                    if pd.isna(val):
                        val = None
                    record[schema_field] = val
            
            if not record.get("full_name") or not record.get("phone"):
                errors.append({"row": index + 2, "reason": "Missing required fields (Name or Phone)"})
                continue
                
            processed_data.append(record)
        except Exception as e:
            errors.append({"row": index + 2, "reason": str(e)})

    return {
        "mapping": mapping,
        "data": processed_data,
        "errors": errors,
        "total": len(df)
    }
