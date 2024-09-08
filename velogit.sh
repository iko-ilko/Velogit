#!/bin/bash

# 스크립트 디렉토리 경로
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 도움말 함수
show_help() {
    echo "사용법: ./velogit.sh [옵션] [파일명]"
    echo "옵션:"
    echo "  -h, --help    도움말 표시"
    echo "  -s, --sync    GitHub과 Velog 동기화"
    echo "예시:"
    echo "  ./velogit.sh post.md     # 'post.md' 파일을 찾아 포스팅"
    echo "  ./velogit.sh --sync      # GitHub과 Velog 동기화"
    echo "  ./velogit.sh --install   # npm 패키지 설치"
}

# 파일 찾기 함수
find_file() {
    local file_name="$1"
    local found_file=$(find "$SCRIPT_DIR/srcs/post_dir" -type f -name "$file_name" -print -quit)
    echo "$found_file"
}

# .env 파일 생성 함수
setup_env() {
    local env_file="$SCRIPT_DIR/.env"
    if [ ! -f "$env_file" ]; then
        touch "$env_file"
    fi
}

# 환경 변수 추가 함수
add_env() {
    local key="$1"
    local value="$2"
    local env_file="$SCRIPT_DIR/.env"
    if grep -q "^$key=" "$env_file"; then
        sed -i '' "s|^$key=.*|$key=$value|" "$env_file"
    else
        echo "\n$key=$value" >> "$env_file"
    fi
}

# 메인 로직
setup_env
add_env "BASE_URL" "$SCRIPT_DIR"
if [ "$1" == "-h" ] || [ "$1" == "--help" ] || [ -z "$1" ]; then
    show_help
elif [ "$1" == "-s" ] || [ "$1" == "--sync" ]; then
    node "$SCRIPT_DIR/srcs/js/main.js" sync
elif [ "$1" == "-i" ] || [ "$1" == "--install" ]; then
    if [ -f "$SCRIPT_DIR/srcs/packages/package.json" ]; then
        echo "Installing packages..."
        cd "$SCRIPT_DIR/srcs/packages"
        npm install
        echo "Packages installed successfully."
        cd "$SCRIPT_DIR"
    else
        echo "Error: Can't find package.json file."
        exit 1
    fi
else
    file_path=$(find_file "$1")
    mark_image=$(dirname "$file_path")
    add_env "CUR_IMG_DIR" "$mark_image"
    echo "mark_image: $mark_image"
    if [ -n "$file_path" ]; then
        node "$SCRIPT_DIR/srcs/js/main.js" post "$file_path"
    else
        echo "Error: File not found: $1"
        exit 1
    fi
fi