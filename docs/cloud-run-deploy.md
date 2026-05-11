# BuddyUp Cloud Run Deployment

This project can run locally with JSON storage or in Google Cloud Run with Firestore.

## Google Cloud Resources

Use these settings:

- Project: `BuddyUp`
- Region: `europe-west3`
- Firestore: `(default)`, Standard Edition, Native mode, restrictive rules
- Artifact Registry repository: `buddyup-api`, Docker, Standard, `europe-west3`
- Cloud Run service: `buddyup-api`

## Required APIs

Enable:

- Cloud Run Admin API
- Cloud Build API
- Artifact Registry API
- Secret Manager API
- Google Cloud Firestore API

## Backend Modes

Local PC:

```powershell
npm run server
```

Cloud Run:

```text
DATA_STORE=firestore
OLLAMA_ENABLED=false
```

Ollama is disabled in Cloud Run because the hosted service cannot reach your local PC model. The coach endpoint falls back to rule-based coaching in Cloud Run. Later we can switch it to Vertex AI, Gemini, OpenAI, or a hosted Ollama endpoint.

## Manual Build And Deploy

After installing and authenticating `gcloud`, this is the shape of the deployment:

```bash
gcloud builds submit --config cloudbuild.yaml
```

Cloud Build will:

1. Build the Docker image from `Dockerfile`.
2. Push it to Artifact Registry.
3. Deploy it to Cloud Run.

## CI/CD

Create a Cloud Build trigger from GitHub:

- Repository: `AsadullahBajwa/buddyUp`
- Branch: `^main$`
- Configuration: Cloud Build configuration file
- File path: `cloudbuild.yaml`

Before the trigger can deploy, the Cloud Build service account may need permission to deploy Cloud Run and write Artifact Registry images.
