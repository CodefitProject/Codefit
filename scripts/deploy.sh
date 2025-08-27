#!/bin/bash

# CodeFIT EC2 배포 스크립트
set -e

echo "배포를 시작합니다..."

# 설정 변수
PROJECT_DIR="/home/ubuntu/codefit"
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 백업 디렉토리가 존재하지 않으면 생성
mkdir -p $BACKUP_DIR

# 프로젝트 디렉토리가 존재하지 않으면 생성
mkdir -p $PROJECT_DIR

# 로그 메시지 출력 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 서비스 상태 확인 함수
check_health() {
    local service_url=$1
    local max_attempts=30
    local attempt=1
    
    log "$service_url 상태를 확인하고 있습니다..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $service_url > /dev/null; then
            log "서비스가 정상 동작 중입니다!"
            return 0
        fi
        
        log "상태 확인 시도 $attempt/$max_attempts 실패. 10초 대기 중..."
        sleep 10
        attempt=$((attempt + 1))
    done
    
    log "$max_attempts번 시도 후 서비스 상태 확인에 실패했습니다"
    return 1
}

# 현재 배포 상태 백업 함수
backup_current() {
    log "현재 상태를 백업하고 있습니다..."
    
    if [ -d "$PROJECT_DIR" ] && [ "$(ls -A $PROJECT_DIR)" ]; then
        tar -czf "$BACKUP_DIR/codefit_backup_$DATE.tar.gz" -C "$PROJECT_DIR" . 2>/dev/null || true
        log "백업이 생성되었습니다: codefit_backup_$DATE.tar.gz"
        
        # 최근 5개 백업만 유지
        cd $BACKUP_DIR
        ls -t codefit_backup_*.tar.gz | tail -n +6 | xargs -r rm
    fi
}

# 배포 롤백 함수
rollback() {
    log "배포를 롤백하고 있습니다..."
    
    # 현재 컨테이너 중지
    cd $PROJECT_DIR
    docker-compose down 2>/dev/null || true
    
    # 최신 백업 찾기
    local latest_backup=$(ls -t $BACKUP_DIR/codefit_backup_*.tar.gz 2>/dev/null | head -n 1)
    
    if [ -n "$latest_backup" ]; then
        log "백업에서 복원 중: $(basename $latest_backup)"
        rm -rf $PROJECT_DIR/*
        tar -xzf "$latest_backup" -C "$PROJECT_DIR"
        
        cd $PROJECT_DIR
        docker-compose up -d
        
        if check_health "http://localhost:8080/health"; then
            log "롤백이 완료되었습니다"
            return 0
        else
            log "롤백에 실패했습니다"
            return 1
        fi
    else
        log "롤백을 위한 백업을 찾을 수 없습니다"
        return 1
    fi
}

# 메인 배포 프로세스
main() {
    log "CodeFIT 배포를 시작합니다"
    
    # 프로젝트 디렉토리로 이동
    cd $PROJECT_DIR
    
    # 현재 상태 백업
    backup_current
    
    # 기존 컨테이너 정상 종료
    log "기존 컨테이너를 중지하고 있습니다..."
    docker-compose down --timeout 30 || true
    
    # 오래된 컨테이너와 이미지 정리
    log "오래된 컨테이너와 이미지를 정리하고 있습니다..."
    docker container prune -f
    docker image prune -f
    
    # 새 컨테이너 시작
    log "새 컨테이너를 시작하고 있습니다..."
    docker-compose up -d --build --force-recreate
    
    # 서비스 시작 대기
    log "서비스 시작을 기다리고 있습니다..."
    sleep 30
    
    # 상태 확인
    log "상태 확인을 수행하고 있습니다..."
    
    # 백엔드 상태 확인
    if ! check_health "http://localhost:8080/health"; then
        log "백엔드 상태 확인 실패, 롤백을 시도합니다..."
        if ! rollback; then
            log "치명적 오류: 롤백에 실패했습니다! 수동 개입이 필요합니다."
            exit 1
        fi
        exit 1
    fi
    
    # 프론트엔드 상태 확인
    if ! check_health "http://localhost:3000"; then
        log "프론트엔드 상태 확인 실패, 롤백을 시도합니다..."
        if ! rollback; then
            log "치명적 오류: 롤백에 실패했습니다! 수동 개입이 필요합니다."
            exit 1
        fi
        exit 1
    fi
    
    # 최종 정리
    log "최종 정리를 수행하고 있습니다..."
    docker image prune -f
    
    log "배포가 성공적으로 완료되었습니다!"
}

# 에러 처리
trap 'log "배포에 실패했습니다! 로그를 확인해주세요."; exit 1' ERR

# 메인 함수 실행
main "$@"