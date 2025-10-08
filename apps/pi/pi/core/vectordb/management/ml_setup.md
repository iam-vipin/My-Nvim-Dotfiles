# OpenSearch ML Model Setup Commands

These are OpenSearch Dev Tools commands for setting up ML Commons, connectors, and models.

## 1. Setup ML Commons to run on non-ML nodes (Only for dev instances where ml-nodes are not setup)

```http
PUT /_cluster/settings
{
  "persistent": {
    "plugins.ml_commons.only_run_on_ml_node": false
  }
}
```

## 2. Setup trusted connector endpoints for Azure AI Foundry

```http
PUT /_cluster/settings
{
  "persistent": {
    "plugins.ml_commons.trusted_connector_endpoints_regex": [
      "^https://azureaitrials-resource\\.services\\.ai\\.azure\\.com(/.*)?"
    ]
  }
}
```

## 3. Create ML connector for Azure AI Foundry

```http
POST /_plugins/_ml/connectors/_create
{
  "name": "cohere_azure_foundry_connector",
  "description": "Azure Foundry Cohere Embedding Connector",
  "version": "1",
  "protocol": "http",
  "parameters": {
    "endpoint": "https://azureaitrials-resource.services.ai.azure.com/models",
    "model": "embed-v-4-0",
    "api_version": "2024-05-01-preview"
  },
  "credential": {
    "openAI_key": "YOUR_AZURE_AI_FOUNDRY_API_KEY"
  },
  "actions": [
    {
      "action_type": "predict",
      "method": "POST",
      "url": "${parameters.endpoint}/embeddings?api-version=${parameters.api_version}",
      "headers": {
        "api-key": "${credential.openAI_key}",
        "x-ms-model-mesh-model-name": "${parameters.model}"
      },
      "request_body": "{ \"input\": ${parameters.input}}",
      "pre_process_function": "connector.pre_process.openai.embedding",
      "post_process_function": "connector.post_process.openai.embedding"
    }
  ]
}
```

## 4. Register ML model with the connector

```http
POST /_plugins/_ml/models/_register
{
  "name": "cohere_4_azure",
  "function_name": "remote",
  "connector_id": "YOUR_CONNECTOR_ID_FROM_STEP_3",
  "description": "Cohere Embedding Model via Azure Foundry"
}
```

## 5. Deploy the registered ML model

```http
POST /_plugins/_ml/models/YOUR_MODEL_ID_FROM_STEP_4/_deploy
```

## 6. Check deployment status (repeat until DEPLOYED)

```http
GET /_plugins/_ml/models/YOUR_MODEL_ID_FROM_STEP_4
```

## 7. Test model inference

```http
POST /_plugins/_ml/models/YOUR_MODEL_ID_FROM_STEP_4/_predict
{
  "parameters": {
    "input": ["hello world test"]
  }
}
```

## Notes

- Replace `YOUR_AZURE_AI_FOUNDRY_API_KEY` with your actual API key
- Replace `YOUR_CONNECTOR_ID_FROM_STEP_3` with the connector_id returned from step 3
- Replace `YOUR_MODEL_ID_FROM_STEP_4` with the model_id returned from step 4
- Wait for deployment to complete before testing inference
- Update your environment variables with the final ML_MODEL_ID for application use 
