#!/bin/bash
# ============================================================================
# JENKINS MANAGEMENT CLI
# Utilidades para gestionar jobs y pipelines de Jenkins desde línea de comandos
# ============================================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
JENKINS_URL="${JENKINS_URL:-http://localhost:8080}"
JENKINS_USER="${JENKINS_USER:-admin}"
JENKINS_TOKEN="${JENKINS_TOKEN:-admin}"
JOB_NAME="Gerson-Docker-Orchestration"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

print_header() {
  echo -e "\n${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}\n"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# COMANDOS
# ============================================================================

# Comando: build - Disparar un build
cmd_build() {
  print_header "Triggering Build: $JOB_NAME"
  
  RESPONSE=$(curl -s -X POST "$JENKINS_URL/job/$JOB_NAME/build" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -w "%{http_code}")
  
  if [[ "$RESPONSE" =~ "201" ]] || [[ "$RESPONSE" =~ "200" ]]; then
    print_success "Build triggered successfully"
    echo "Build Queue: $JENKINS_URL/queue/"
    echo "Job Page: $JENKINS_URL/job/$JOB_NAME/"
  else
    print_error "Failed to trigger build (HTTP $RESPONSE)"
  fi
}

# Comando: build-params - Disparar build con parámetros
cmd_build_params() {
  local branch="${1:-main}"
  local clean="${2:-true}"
  local perf_test="${3:-false}"
  
  print_header "Triggering Build with Parameters"
  echo "Branch: $branch"
  echo "Clean Build: $clean"
  echo "Performance Tests: $perf_test"
  
  PARAMS_JSON="{\"parameter\":[{\"name\":\"GIT_BRANCH\",\"value\":\"$branch\"},{\"name\":\"CLEAN_BUILD\",\"value\":\"$clean\"},{\"name\":\"RUN_PERFORMANCE_TESTS\",\"value\":\"$perf_test\"}]}"
  
  RESPONSE=$(curl -s -X POST "$JENKINS_URL/job/$JOB_NAME/buildWithParameters" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -H "Content-Type: application/json" \
    --data "$PARAMS_JSON" \
    -w "%{http_code}")
  
  if [[ "$RESPONSE" =~ "201" ]] || [[ "$RESPONSE" =~ "200" ]]; then
    print_success "Build triggered with parameters"
    echo "Build Queue: $JENKINS_URL/queue/"
  else
    print_error "Failed to trigger build (HTTP $RESPONSE)"
  fi
}

# Comando: status - Ver estado del último build
cmd_status() {
  print_header "Build Status: $JOB_NAME"
  
  STATUS=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/api/json" | \
    jq -r '.result // .building')
  
  BUILD_NUM=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/api/json" | \
    jq -r '.number')
  
  BUILD_URL_FULL="$JENKINS_URL/job/$JOB_NAME/$BUILD_NUM/"
  
  case "$STATUS" in
    "SUCCESS")
      print_success "Last build: #$BUILD_NUM - SUCCESS"
      ;;
    "FAILURE")
      print_error "Last build: #$BUILD_NUM - FAILURE"
      ;;
    "true")
      print_info "Build #$BUILD_NUM - IN PROGRESS"
      ;;
    "UNSTABLE")
      print_warning "Last build: #$BUILD_NUM - UNSTABLE"
      ;;
    *)
      print_info "Build #$BUILD_NUM - $STATUS"
      ;;
  esac
  
  echo "Build URL: $BUILD_URL_FULL"
  echo "Console: $BUILD_URL_FULL/console"
}

# Comando: logs - Ver logs del último build
cmd_logs() {
  local lines="${1:-50}"
  
  print_header "Build Logs (last $lines lines)"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/consoleText" | \
    tail -n "$lines"
}

# Comando: history - Ver historial de builds
cmd_history() {
  local count="${1:-10}"
  
  print_header "Build History (last $count builds)"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/api/json?tree=builds[number,result,timestamp,duration]{0,$count}" | \
    jq -r '.builds[] | "\(.number) | \(.result // "IN_PROGRESS") | \(.timestamp) | \(.duration)ms"' | \
    while IFS='|' read -r num result timestamp duration; do
      printf "Build #%-5s | %-12s | %s | %s\n" "$num" "$result" "$timestamp" "$duration"
    done
}

# Comando: stop - Detener el último build
cmd_stop() {
  print_header "Stopping Last Build"
  
  BUILD_NUM=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/api/json" | \
    jq -r '.number')
  
  RESPONSE=$(curl -s -X POST \
    "$JENKINS_URL/job/$JOB_NAME/$BUILD_NUM/stop" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -w "%{http_code}")
  
  if [[ "$RESPONSE" =~ "200" ]] || [[ "$RESPONSE" =~ "204" ]]; then
    print_success "Build #$BUILD_NUM stopped"
  else
    print_error "Failed to stop build"
  fi
}

# Comando: artifacts - Listar artefactos del último build
cmd_artifacts() {
  print_header "Build Artifacts"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/api/json" | \
    jq -r '.artifacts[] | "\(.displayPath) (\(.relativePath))"' || \
    print_warning "No artifacts found"
}

# Comando: download-artifacts - Descargar artefactos
cmd_download_artifacts() {
  local output_dir="${1:-.}"
  
  print_header "Downloading Artifacts to $output_dir"
  
  mkdir -p "$output_dir"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/api/json" | \
    jq -r '.artifacts[] | "\(.relativePath)"' | \
    while read -r artifact; do
      print_info "Downloading: $artifact"
      curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
        "$JENKINS_URL/job/$JOB_NAME/lastBuild/artifact/$artifact" \
        -o "$output_dir/$(basename "$artifact")"
    done
  
  print_success "Artifacts downloaded to $output_dir"
  ls -lh "$output_dir"
}

# Comando: test-results - Mostrar resultados de tests
cmd_test_results() {
  print_header "Test Results"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/lastBuild/testReport/api/json" | \
    jq '.suites[] | "\(.name): \(.cases | length) tests, \(.duration)ms"' || \
    print_warning "No test results found"
}

# Comando: config - Mostrar configuración del job
cmd_config() {
  print_header "Job Configuration"
  
  curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/api/json" | \
    jq '{
      name: .fullDisplayName,
      description: .description,
      url: .url,
      lastBuild: .lastBuild.number,
      lastSuccessful: .lastSuccessfulBuild.number,
      inQueue: .inQueue,
      buildable: .buildable
    }' || print_error "Could not fetch job config"
}

# Comando: enable - Habilitar job
cmd_enable() {
  print_header "Enabling Job"
  
  curl -s -X POST \
    "$JENKINS_URL/job/$JOB_NAME/enable" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -w "%{http_code}" > /dev/null
  
  print_success "Job enabled"
}

# Comando: disable - Deshabilitar job
cmd_disable() {
  print_header "Disabling Job"
  
  curl -s -X POST \
    "$JENKINS_URL/job/$JOB_NAME/disable" \
    -u "$JENKINS_USER:$JENKINS_TOKEN" \
    -w "%{http_code}" > /dev/null
  
  print_success "Job disabled"
}

# Comando: delete - Eliminar job
cmd_delete() {
  print_warning "This will delete the job: $JOB_NAME"
  read -p "Are you sure? (yes/no): " confirm
  
  if [ "$confirm" = "yes" ]; then
    curl -s -X POST \
      "$JENKINS_URL/job/$JOB_NAME/doDelete" \
      -u "$JENKINS_USER:$JENKINS_TOKEN" \
      -w "%{http_code}" > /dev/null
    
    print_success "Job deleted"
  else
    print_info "Deletion cancelled"
  fi
}

# Comando: health - Verificar salud de Jenkins
cmd_health() {
  print_header "Jenkins Health Check"
  
  # Verificar acceso a Jenkins
  if curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" "$JENKINS_URL/api/json" > /dev/null; then
    print_success "Jenkins is accessible"
  else
    print_error "Cannot reach Jenkins at $JENKINS_URL"
    return 1
  fi
  
  # Obtener información de Jenkins
  VERSION=$(curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/api/json" | jq -r '.version')
  
  echo "Jenkins URL: $JENKINS_URL"
  echo "Jenkins Version: $VERSION"
  
  # Verificar job
  if curl -s -u "$JENKINS_USER:$JENKINS_TOKEN" \
    "$JENKINS_URL/job/$JOB_NAME/api/json" > /dev/null; then
    print_success "Job '$JOB_NAME' exists"
  else
    print_error "Job '$JOB_NAME' not found"
  fi
}

# Comando: help
cmd_help() {
  cat << EOF

${BLUE}JENKINS MANAGEMENT CLI${NC}

Usage: ./jenkins-cli.sh [COMMAND] [OPTIONS]

${BLUE}COMMANDS:${NC}

  build                     Trigger a new build
  build-params              Trigger build with parameters
                            Usage: build-params [branch] [clean] [perf-tests]
                            Example: build-params main true false

  status                    Show last build status
  logs                      Show build logs (default: last 50 lines)
                            Usage: logs [NUMBER_OF_LINES]
  
  history                   Show build history
                            Usage: history [COUNT]
  
  stop                      Stop the current/last build
  
  artifacts                 List build artifacts
  download-artifacts        Download all artifacts
                            Usage: download-artifacts [OUTPUT_DIR]
  
  test-results              Show test results from last build
  
  config                    Show job configuration
  
  enable                    Enable the job
  disable                   Disable the job
  delete                    Delete the job
  
  health                    Check Jenkins health and connectivity
  
  help                       Show this help message

${BLUE}ENVIRONMENT VARIABLES:${NC}

  JENKINS_URL               Jenkins base URL (default: http://localhost:8080)
  JENKINS_USER              Jenkins username (default: admin)
  JENKINS_TOKEN             Jenkins API token (default: admin)

${BLUE}EXAMPLES:${NC}

  # Trigger a build
  ./jenkins-cli.sh build

  # Check build status
  ./jenkins-cli.sh status

  # View build logs
  ./jenkins-cli.sh logs 100

  # Download artifacts
  ./jenkins-cli.sh download-artifacts ./artifacts

  # Check Jenkins health
  ./jenkins-cli.sh health

${BLUE}CONFIGURATION:${NC}

  Set environment variables before running:
  
  export JENKINS_URL="http://jenkins.example.com:8080"
  export JENKINS_USER="your-username"
  export JENKINS_TOKEN="your-api-token"

EOF
}

# ============================================================================
# MAIN
# ============================================================================

main() {
  local command="${1:-help}"
  
  case "$command" in
    build)
      cmd_build
      ;;
    build-params)
      cmd_build_params "$2" "$3" "$4"
      ;;
    status)
      cmd_status
      ;;
    logs)
      cmd_logs "$2"
      ;;
    history)
      cmd_history "$2"
      ;;
    stop)
      cmd_stop
      ;;
    artifacts)
      cmd_artifacts
      ;;
    download-artifacts)
      cmd_download_artifacts "$2"
      ;;
    test-results)
      cmd_test_results
      ;;
    config)
      cmd_config
      ;;
    enable)
      cmd_enable
      ;;
    disable)
      cmd_disable
      ;;
    delete)
      cmd_delete
      ;;
    health)
      cmd_health
      ;;
    help)
      cmd_help
      ;;
    *)
      print_error "Unknown command: $command"
      cmd_help
      exit 1
      ;;
  esac
}

# Ejecutar main
main "$@"
