#!/bin/bash

# EC2 초기 설정 스크립트
set -e

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

log "EC2 인스턴스 초기 설정을 시작합니다..."

# 시스템 패키지 업데이트
log "시스템 패키지를 업데이트하고 있습니다..."
sudo apt-get update -y

# 필수 패키지 설치
log "필수 패키지를 설치하고 있습니다..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Docker 설치
log "Docker를 설치하고 있습니다..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker Compose 설치
log "Docker Compose를 설치하고 있습니다..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 현재 사용자를 docker 그룹에 추가
log "사용자를 docker 그룹에 추가하고 있습니다..."
sudo usermod -aG docker $USER

# Docker 서비스 시작 및 부팅 시 자동 시작 설정
log "Docker 서비스를 설정하고 있습니다..."
sudo systemctl start docker
sudo systemctl enable docker

# 프로젝트 디렉토리 생성
log "프로젝트 디렉토리를 생성하고 있습니다..."
mkdir -p /home/ubuntu/codefit
mkdir -p /home/ubuntu/backups

# 배포 스크립트 실행 권한 부여
if [ -f "/home/ubuntu/codefit/scripts/deploy.sh" ]; then
    log "배포 스크립트에 실행 권한을 부여하고 있습니다..."
    chmod +x /home/ubuntu/codefit/scripts/deploy.sh
fi

# 방화벽 설정 (필요한 포트 개방)
log "방화벽 포트를 설정하고 있습니다..."
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3000    # Frontend (개발용)
sudo ufw allow 8080    # Backend API
sudo ufw --force enable

# 시스템 정보 출력
log "설치된 버전 정보:"
docker --version
docker-compose --version

log "EC2 초기 설정이 완료되었습니다!"
log "변경사항을 적용하려면 다시 로그인하거나 다음 명령어를 실행하세요:"
log "newgrp docker"