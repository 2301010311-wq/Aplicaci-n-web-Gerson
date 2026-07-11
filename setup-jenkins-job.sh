#!/bin/bash
# ============================================================================
# SETUP SCRIPT: Crear Job en Jenkins para Ejecutar Docker Orchestration
# ============================================================================
# Uso: ./setup-jenkins-job.sh
# Este script crea automáticamente un job en Jenkins que ejecuta el pipeline
# de orquestación Docker para la aplicación Pollería Gerson
# ============================================================================

set -e

JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"
JENKINS_USER="${JENKINS_USER:-admin}"
JENKINS_TOKEN="${JENKINS_TOKEN:-changeme}"
JOB_NAME="Gerson-Docker-Orchestration"
GIT_REPO="${GIT_REPO:-https://github.com/tu-usuario/aplicacion-web-gerson.git}"
GIT_BRANCH="main"
JENKINSFILE_PATH="Jenkinsfile.docker-orchestration"

echo "🔧 Setting up Jenkins Job for Docker Orchestration Pipeline"
echo ""
echo "Jenkins URL: $JENKINS_URL"
echo "Job Name: $JOB_NAME"
echo "Git Repository: $GIT_REPO"
echo ""

# ============================================================================
# 1. Crear credenciales en Jenkins (si no existen)
# ============================================================================
echo "📝 Creating Jenkins Credentials..."

create_credential() {
  local cred_id=$1
  local cred_description=$2
  local cred_type=$3
  local cred_value=$4
  
  echo "  Creating credential: $cred_id..."
  
  curl -s -X POST "$JENKINS_URL/credentials/store/system/domain/_/createCredentials" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
      \"credentials\": {
        \"id\": \"$cred_id\",
        \"description\": \"$cred_description\",
        \"$cred_type\": \"$cred_value\"
      }
    }" || echo "  ⚠️  Could not create credential (may already exist)"
}

# Crear credenciales secretas (mejor hacer esto manualmente en Jenkins UI)
echo "  ℹ️  Credenciales requeridas (crear manualmente en Jenkins):"
echo "    - gerson-db-user (secret text)"
echo "    - gerson-db-password (secret text)"
echo "    - gerson-jwt-secret (secret text)"
echo "    - github-credentials (GitHub personal access token)"
echo ""

# ============================================================================
# 2. Crear el Job en Jenkins
# ============================================================================
echo "🏗️  Creating Pipeline Job in Jenkins..."

JOB_CONFIG=$(cat <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<org.jenkinsci.plugins.workflow.job.WorkflowJob plugin="workflow-job@1411.v6c38bda54b_2e">
  <actions/>
  <description>Docker Orchestration Pipeline - Construye, prueba y ejecuta todos los contenedores de la aplicación Pollería Gerson</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <com.cloudbees.jenkins.plugins.bitbucket.BitbucketPushTrigger plugin="bitbucket@3.3.1">
          <spec></spec>
        </com.cloudbees.jenkins.plugins.bitbucket.BitbucketPushTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.StringParameterDefinition>
          <name>GIT_BRANCH</name>
          <description>Git branch to build</description>
          <defaultValue>main</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>CLEAN_BUILD</name>
          <description>Remove previous containers and volumes before build</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>RUN_PERFORMANCE_TESTS</name>
          <description>Execute performance and load tests</description>
          <defaultValue>false</defaultValue>
        </hudson.model.BooleanParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@3816.v48b_5f5a_56158">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@5.0.0">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>GIT_REPO_URL</url>
          <credentialsId>github-credentials</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/GIT_BRANCH_NAME</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="java.util.ArrayList"/>
      <extensions>
        <hudson.plugins.git.extensions.impl.CloneOption>
          <shallow>false</shallow>
          <noTags>false</noTags>
          <reference></reference>
          <timeout>20</timeout>
          <depth>0</depth>
          <performshallow>false</performshallow>
          <honorRefspec>false</honorRefspec>
        </hudson.plugins.git.extensions.impl.CloneOption>
      </extensions>
    </scm>
    <scriptPath>Jenkinsfile.docker-orchestration</scriptPath>
    <lightweight>false</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</org.jenkinsci.plugins.workflow.job.WorkflowJob>
EOF
)

# Reemplazar placeholders
JOB_CONFIG="${JOB_CONFIG//GIT_REPO_URL/$GIT_REPO}"
JOB_CONFIG="${JOB_CONFIG//GIT_BRANCH_NAME/$GIT_BRANCH}"

# Enviar configuración a Jenkins
curl -s -X POST "$JENKINS_URL/createItem?name=$JOB_NAME" \
  -u "$JENKINS_USER:$JENKINS_TOKEN" \
  -H "Content-Type: application/xml" \
  --data "$JOB_CONFIG"

if [ $? -eq 0 ]; then
  echo "✅ Job '$JOB_NAME' created successfully"
else
  echo "❌ Failed to create job. It may already exist."
fi

echo ""

# ============================================================================
# 3. Esperar a que Jenkins procese el job
# ============================================================================
echo "⏳ Waiting for Jenkins to process the job..."
sleep 5

# ============================================================================
# 4. Disparar primer build
# ============================================================================
echo "🚀 Triggering first build..."

BUILD_RESPONSE=$(curl -s -X POST "$JENKINS_URL/job/$JOB_NAME/build" \
  -u "$JENKINS_USER:$JENKINS_TOKEN")

if [ $? -eq 0 ]; then
  echo "✅ Build triggered successfully"
  echo ""
  echo "📊 Build Details:"
  echo "  Job URL: $JENKINS_URL/job/$JOB_NAME/"
  echo "  Console Output: $JENKINS_URL/job/$JOB_NAME/lastBuild/console"
else
  echo "❌ Failed to trigger build"
fi

echo ""
echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure credentials in Jenkins:"
echo "   - Go to: $JENKINS_URL/credentials/"
echo "   - Add secrets for: gerson-db-user, gerson-db-password, gerson-jwt-secret"
echo ""
echo "2. Monitor the pipeline:"
echo "   - Jenkins Dashboard: $JENKINS_URL"
echo "   - Job URL: $JENKINS_URL/job/$JOB_NAME/"
echo ""
