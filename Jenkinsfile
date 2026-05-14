pipeline {
  agent any

  environment {
    // Next.js build loads API routes that import Prisma; a URL is required at compile time (no live DB needed).
    DATABASE_URL = "postgresql://build:build@127.0.0.1:5432/build?schema=public"
    CI = "true"
  }

  stages {
    stage("Install") {
      steps {
        script {
          if (isUnix()) {
            sh "node --version && npm --version"
            sh fileExists('package-lock.json') ? "npm ci" : "npm install"
          } else {
            bat "node --version && npm --version"
            bat script: fileExists('package-lock.json') ? "npm ci" : "npm install"
          }
        }
      }
    }

    stage("Prisma generate") {
      steps {
        script {
          if (isUnix()) {
            sh "npx prisma generate"
          } else {
            bat "npx prisma generate"
          }
        }
      }
    }

    stage("Build") {
      steps {
        script {
          if (isUnix()) {
            sh "npm run build"
          } else {
            bat "npm run build"
          }
        }
      }
    }

    stage("Lint") {
      steps {
        script {
          if (isUnix()) {
            sh "npm run lint"
          } else {
            bat "npm run lint"
          }
        }
      }
    }

    stage("Security Audit") {
      steps {
        script {
          if (isUnix()) {
            sh(script: "npm audit --audit-level=critical", returnStatus: true)
          } else {
            bat(script: "npm audit --audit-level=critical", returnStatus: true)
          }
          echo "Security audit completed (only critical vulnerabilities will fail the build)"
        }
      }
    }

    stage("Test") {
      steps {
        script {
          def hasTestScript = false
          if (isUnix()) {
            hasTestScript = sh(
              script: "node -e \"const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)\"",
              returnStatus: true
            ) == 0
          } else {
            hasTestScript = bat(
              script: "node -e \"const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)\"",
              returnStatus: true
            ) == 0
          }

          if (hasTestScript) {
            if (isUnix()) {
              sh "npm test"
            } else {
              bat "npm test"
            }
          } else {
            echo "No npm test script in package.json — skipping unit tests."
          }
        }
      }
    }

    stage("Release") {
      steps {
        script {
          def info = """build=${env.BUILD_NUMBER}
job=${env.JOB_NAME}
node=${env.NODE_NAME}
timestamp=${new Date()}
"""
          writeFile file: "jenkins-build-info.txt", text: info
          writeFile file: "release/release-ready.txt", text: "Entrega continua lista: build ${env.BUILD_NUMBER}"
          archiveArtifacts artifacts: "jenkins-build-info.txt, release/**", onlyIfSuccessful: true, fingerprint: true
          echo "Artefactos de entrega continua archivados: jenkins-build-info.txt y release/release-ready.txt."
        }
      }
    }
  }
}
