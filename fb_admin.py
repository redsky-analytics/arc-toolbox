#%%
import json
from pathlib import Path
from firebase_admin import auth, initialize_app, get_app
from firebase_admin import credentials

cred = credentials.Certificate('fb-sa.json')
initialize_app(cred)


#%%
import requests
def sign_in_with_email_and_password(email, password, return_secure_token=True):
    auth_config = json.loads(Path('firebase-auth.json').read_text())
    payload = json.dumps({"email":email, "password":password, "return_secure_token":return_secure_token})
    rest_api_url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
    r = requests.post(rest_api_url,
                  params={"key": auth_config['apiKey']},
                  data=payload)

    return r.json()

sign_in_with_email_and_password('jmulla@gmail.com','Jaz313233ajka!!')

#%%
