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
}

# 파일 찾기 함수
find_file() {
    local file_name="$1"
    local found_file=$(find "$SCRIPT_DIR/srcs/post_dir" -type f -name "$file_name" -print -quit)
    echo "$found_file"
}

# 메인 로직
if [ "$1" == "-h" ] || [ "$1" == "--help" ] || [ -z "$1" ]; then
    show_help
elif [ "$1" == "-s" ] || [ "$1" == "--sync" ]; then
    node "$SCRIPT_DIR/srcs/main.js" sync
else
    file_path=$(find_file "$1")
    if [ -n "$file_path" ]; then
        node "$SCRIPT_DIR/srcs/main.js" post "$file_path"
    else
        echo "오류: 파일을 찾을 수 없습니다: $1"
        exit 1
    fi
fi