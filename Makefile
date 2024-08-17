# 변수 정의
NODE = node
SCRIPT = script.js

# 기본 목표
.DEFAULT_GOAL := help

# 도움말
help:
	@echo "사용법: make [명령어] file=[파일명]"
	@echo "명령어:"
	@echo "  post     : 마크다운 파일을 GitHub Pages와 Velog에 포스팅"
	@echo "  preview  : 마크다운 파일 미리보기 생성"
	@echo "  clean    : 생성된 임시 파일 삭제"

# 포스팅
post:
	@if [ -z "$(file)" ]; then \
		echo "오류: 파일명을 지정해주세요. 예: make post file=my_post.md"; \
		exit 1; \
	fi
	$(NODE) $(SCRIPT) post $(file)

# 미리보기
preview:
	@if [ -z "$(file)" ]; then \
		echo "오류: 파일명을 지정해주세요. 예: make preview file=my_post.md"; \
		exit 1; \
	fi
	$(NODE) $(SCRIPT) preview $(file)

# 청소
clean:
	rm -f *.html
	rm -rf temp

# PHONY 목표 선언
.PHONY: help post preview clean
