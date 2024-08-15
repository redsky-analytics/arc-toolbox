if [ ! -f .env ]; then
    echo $AWSENV>.env
fi

if [ ! -f fb-sa.json ]; then
    echo $FBSA>fb-sa.json
fi

if [ ! -f firebase-auth.json ]; then
    echo $FB>firebase-auth.json
fi

source .venv/bin/activate
set -o allexport
source .env